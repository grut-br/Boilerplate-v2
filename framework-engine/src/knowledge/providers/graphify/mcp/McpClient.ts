import type { McpTransport } from './McpTransport.ts';
import type { McpPayload } from './McpProtocol.ts';
import { McpProtocol } from './McpProtocol.ts';
import type { McpHealth } from './McpHealth.ts';
import {
  McpConnectionError,
  McpTimeout,
  McpProtocolError,
  HandshakeFailed
} from './McpErrors.ts';

export class McpClient {
  private readonly transport: McpTransport;
  private isConnected = false;
  private lastPingTimestamp = 0;
  private latency = 0;
  private messageIdCounter = 0;
  private readonly pendingRequests = new Map<string | number, {
    resolve: (res: McpPayload) => void;
    reject: (err: Error) => void;
    timer: any;
  }>();

  constructor(transport: McpTransport) {
    this.transport = transport;
    this.transport.onMessage((payload) => this.handleMessage(payload));
  }

  async connect(timeoutMs = 1000): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.transport.connect();
      this.isConnected = true;

      const handshakePayload: McpPayload = {
        jsonrpc: '2.0',
        id: this.nextId(),
        method: 'initialize',
        params: {
          protocolVersion: McpProtocol.version,
          capabilities: {},
          clientInfo: { name: 'DevioFrameworkMcpClient', version: '4.0.0' }
        }
      };

      const response = await this.sendWithTimeout(handshakePayload, timeoutMs);
      this.validateProtocol(response);

    } catch (error) {
      this.isConnected = false;
      await this.transport.disconnect();
      throw new HandshakeFailed(error instanceof Error ? error.message : String(error));
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    for (const [id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new McpConnectionError('Client disconnected.'));
    }
    this.pendingRequests.clear();

    await this.transport.disconnect();
    this.isConnected = false;
  }

  async ping(timeoutMs = 500): Promise<number> {
    this.ensureConnected();
    const start = Date.now();
    const payload: McpPayload = {
      jsonrpc: '2.0',
      id: this.nextId(),
      method: 'ping',
    };

    const response = await this.sendWithTimeout(payload, timeoutMs);
    if (response.result !== 'pong') {
      throw new McpProtocolError('Invalid ping response.');
    }

    this.latency = Date.now() - start;
    this.lastPingTimestamp = Date.now();
    return this.latency;
  }

  async request(payload: Omit<McpPayload, 'jsonrpc' | 'id'>, timeoutMs = 2000): Promise<McpPayload> {
    this.ensureConnected();
    const fullPayload: McpPayload = {
      jsonrpc: '2.0',
      id: this.nextId(),
      ...payload,
    };

    return this.sendWithTimeout(fullPayload, timeoutMs);
  }

  getHealth(): McpHealth {
    return {
      connected: this.isConnected,
      latency: this.latency,
      version: McpProtocol.version,
      transport: this.transport.name,
      lastPing: this.lastPingTimestamp,
      status: this.isConnected ? 'active' : 'disconnected',
      warnings: [],
    };
  }

  validateProtocol(response: McpPayload): void {
    if (response.jsonrpc !== '2.0') {
      throw new McpProtocolError('Invalid JSON-RPC protocol version.');
    }
    if (response.error) {
      throw new McpProtocolError(`Protocol error code ${response.error.code}: ${response.error.message}`);
    }
  }

  private nextId(): number {
    return ++this.messageIdCounter;
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new McpConnectionError('Client is not connected.');
    }
  }

  private async sendWithTimeout(payload: McpPayload, timeoutMs: number): Promise<McpPayload> {
    const id = payload.id!;
    
    return new Promise<McpPayload>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new McpTimeout(`Request with ID ${id} timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      this.transport.send(payload).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(new McpConnectionError(err.message));
      });
    });
  }

  private handleMessage(payload: McpPayload): void {
    const id = payload.id;
    if (id === undefined || id === null) return;

    const request = this.pendingRequests.get(id);
    if (request) {
      clearTimeout(request.timer);
      this.pendingRequests.delete(id);
      
      if (payload.error) {
        request.reject(new McpProtocolError(`MCP error ${payload.error.code}: ${payload.error.message}`));
      } else {
        request.resolve(payload);
      }
    }
  }
}
