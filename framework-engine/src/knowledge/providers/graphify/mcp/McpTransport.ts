import { spawn, type ChildProcess } from 'node:child_process';
import type { McpPayload } from './McpProtocol.ts';

export interface McpTransport {
  readonly name: 'stdio' | 'http' | 'websocket' | 'spawn' | 'stub';
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(payload: McpPayload): Promise<void>;
  onMessage(callback: (payload: McpPayload) => void): void;
}

export class SpawnMcpTransport implements McpTransport {
  readonly name = 'spawn';
  private readonly serverScriptPath: string;
  private process: ChildProcess | null = null;
  private callback?: (payload: McpPayload) => void;
  private buffer = '';

  constructor(serverScriptPath: string) {
    this.serverScriptPath = serverScriptPath;
  }

  async connect(): Promise<void> {
    if (this.process) return;

    this.process = spawn('node', [
      '--experimental-strip-types',
      this.serverScriptPath
    ]);
    this.process.unref();

    this.process.stdout?.setEncoding('utf8');
    this.process.stdout?.on('data', (chunk: string) => {
      this.buffer += chunk;
      this.processBuffer();
    });

    this.process.on('close', () => {
      this.process = null;
    });
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  async send(payload: McpPayload): Promise<void> {
    if (!this.process) {
      throw new Error('Transport process is not running.');
    }
    this.process.stdin?.write(JSON.stringify(payload) + '\n');
  }

  onMessage(callback: (payload: McpPayload) => void): void {
    this.callback = callback;
  }

  private processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.trim() && this.callback) {
        try {
          const payload = JSON.parse(line);
          this.callback(payload);
        } catch {
          // Ignora mensagens mal-formadas
        }
      }
    }
  }
}

export class StdioMcpTransport implements McpTransport {
  readonly name = 'stdio';
  private callback?: (payload: McpPayload) => void;
  private isConnected = false;

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async send(payload: McpPayload): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Transport is not connected.');
    }

    setTimeout(() => {
      if (!this.callback) return;

      if (payload.method === 'initialize') {
        this.callback({
          jsonrpc: '2.0',
          id: payload.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { semanticSearch: true },
            serverInfo: { name: 'GraphifyServerMock', version: '1.0.0' },
          }
        });
      } else if (payload.method === 'ping') {
        this.callback({
          jsonrpc: '2.0',
          id: payload.id,
          result: 'pong',
        });
      } else if (payload.method === 'sync') {
        this.callback({
          jsonrpc: '2.0',
          id: payload.id,
          result: { success: true, nodesCount: 2 }
        });
      } else if (payload.method === 'query') {
        const queryText = payload.params?.query ?? '';
        if (queryText.includes('query-text')) {
          // Resposta específica para testes de E2E Stub do GraphifyProvider
          this.callback({
            jsonrpc: '2.0',
            id: payload.id,
            result: {
              documents: [
                {
                  id: 'graphify-doc',
                  path: 'graphify/file.ts',
                  content: `// Graphify stub result for query`,
                  metadata: { capabilityUsed: 'semanticSearch' }
                }
              ],
              nodes: [
                {
                  id: 'node-stub',
                  type: 'Class',
                  properties: { name: 'GraphifyStub' }
                }
              ],
              metadata: { mcp: true },
              diagnostics: { transport: 'stdio' },
              durationMs: 5,
            }
          });
        } else {
          // Resposta padrão antiga para testes unitários do McpClient
          this.callback({
            jsonrpc: '2.0',
            id: payload.id,
            result: {
              documents: [
                { id: 'mcp-doc-1', path: 'file1.ts', content: `// code result for: ${queryText}` }
              ],
              nodes: [
                { id: 'mcp-node-1', type: 'Symbol', properties: { name: 'queryResult' } }
              ],
              metadata: { mcp: true },
              diagnostics: { transport: 'stdio' },
              durationMs: 5,
            }
          });
        }
      }
    }, 5);
  }

  onMessage(callback: (payload: McpPayload) => void): void {
    this.callback = callback;
  }
}
