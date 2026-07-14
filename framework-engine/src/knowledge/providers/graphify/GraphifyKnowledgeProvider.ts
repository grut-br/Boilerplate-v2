/**
 * GraphifyKnowledgeProvider
 *
 * Provedor do Graphify que gerencia a inicialização do subprocesso MCP e execução de queries.
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { KnowledgeProvider } from '../../contracts/KnowledgeProvider.ts';
import type { KnowledgeRequest } from '../../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../../contracts/KnowledgeResult.ts';
import type { GraphifyConfiguration } from './GraphifyConfiguration.ts';
import { GraphifyMapper } from './GraphifyMapper.ts';
import { isCapabilitySupported } from './GraphifyCapabilities.ts';
import type { GraphifyHealth } from './GraphifyHealth.ts';
import {
  GraphifyNotConfigured,
  GraphifyUnavailable,
  GraphifyConfigurationError,
  UnsupportedCapability
} from './GraphifyErrors.ts';
import { McpClient } from './mcp/McpClient.ts';
import { SpawnMcpTransport, StdioMcpTransport } from './mcp/McpTransport.ts';
import { toGraphifyResponse } from './mcp/McpResponse.ts';
import { GraphProcessManager } from './process/GraphProcessManager.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GraphifyKnowledgeProvider implements KnowledgeProvider {
  readonly id = 'graphify';
  readonly name = 'Graphify Knowledge Provider';

  private readonly config: GraphifyConfiguration;
  private readonly mapper = new GraphifyMapper();
  private status: 'idle' | 'initialized' | 'shutdown' = 'idle';
  private mcpClient?: McpClient;
  private processManager?: GraphProcessManager;

  constructor(config: GraphifyConfiguration) {
    this.config = config;
    this.validateConfiguration();
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      throw new GraphifyNotConfigured('Graphify is disabled in configuration.');
    }

    const serverPath = path.resolve(path.join(__dirname, './mcp/GraphifyMcpServer.ts'));

    if (this.config.transport === 'stdio' || this.config.transport === 'mcp') {
      // Inicializa e dá start no subprocesso real do Graphify MCP Server
      this.processManager = new GraphProcessManager({
        command: 'node',
        args: ['--experimental-strip-types'],
        autoRestart: true,
        maxRestarts: 3,
        workspaceRoot: this.config.workspaceRoot,
        graphLocation: this.config.graphLocation,
        timeout: this.config.timeout
      });

      await this.processManager.start();

      // Conecta o cliente MCP ao processo real
      const transport = new SpawnMcpTransport(serverPath);
      this.mcpClient = new McpClient(transport);
      await this.mcpClient.connect(this.config.timeout ?? 2000);

      // Handshake inicial enviando a localização do graph.json
      await this.mcpClient.request({
        method: 'initialize',
        params: {
          graphLocation: this.config.graphLocation
        }
      });
    } else if (this.config.transport === 'stub') {
      const transport = new StdioMcpTransport();
      this.mcpClient = new McpClient(transport);
      await this.mcpClient.connect(this.config.timeout ?? 1000);
      
      await this.mcpClient.request({
        method: 'initialize',
        params: {
          graphLocation: this.config.graphLocation
        }
      });
    }

    this.status = 'initialized';
  }

  async shutdown(): Promise<void> {
    if (this.mcpClient) {
      await this.mcpClient.disconnect();
    }
    if (this.processManager) {
      await this.processManager.shutdown();
    }
    this.status = 'shutdown';
  }

  getStatus(): string {
    return this.status;
  }

  async query(request: KnowledgeRequest): Promise<KnowledgeResult> {
    if (this.status !== 'initialized') {
      throw new GraphifyUnavailable('Graphify provider is not initialized.');
    }

    if (request.capability && !isCapabilitySupported(request.capability)) {
      throw new UnsupportedCapability(request.capability);
    }

    // LAZY SYNC & GHOST STATE PROTECTION:
    // Antes de qualquer consulta, se o estado estiver dirty, sincroniza o grafo para evitar leituras desatualizadas
    if (this.processManager) {
      const health = this.processManager.health();
      if (health.dirty) {
        await this.processManager.synchronize();
      }
    }

    const start = Date.now();

    const graphifyReq = this.mapper.toGraphifyRequest(request, this.config.maxDepth, this.config.maxNodes);

    if (this.mcpClient) {
      const responsePayload = await this.mcpClient.request({
        method: 'query',
        params: graphifyReq,
      }, this.config.timeout ?? 2000);

      const graphifyRes = toGraphifyResponse(responsePayload);
      return this.mapper.toKnowledgeResult(graphifyRes);
    }

    // Fallback stub de dados sintéticos se por acaso não houver cliente MCP ativo
    const graphifyRes = {
      documents: [
        {
          id: 'graphify-doc',
          path: 'graphify/file.ts',
          content: `// Graphify stub result for query: ${graphifyReq.query}`,
          metadata: { capabilityUsed: request.capability },
        }
      ],
      nodes: [
        {
          id: 'node-stub',
          type: 'Class',
          properties: { name: 'GraphifyStub', query: graphifyReq.query },
          metadata: { depth: graphifyReq.depth },
        }
      ],
      metadata: { source: 'graphify-adapter-stub', cacheHit: !!this.config.cacheEnabled },
      diagnostics: { transport: this.config.transport },
      durationMs: Date.now() - start,
    };

    return this.mapper.toKnowledgeResult(graphifyRes);
  }

  // --- Operações de Conveniência do Graphify ---

  async search(query: string): Promise<any> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'search',
      params: { query },
    });
    return res.result;
  }

  async lookup(symbolName: string): Promise<any> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'lookup',
      params: { symbolName },
    });
    return res.result;
  }

  async dependencies(symbolName: string): Promise<any> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'dependencies',
      params: { symbolName },
    });
    return res.result;
  }

  async references(symbolName: string): Promise<any> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'references',
      params: { symbolName },
    });
    return res.result;
  }

  async symbols(): Promise<string[]> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'symbols',
      params: {},
    });
    return (res.result?.symbols as string[]) ?? [];
  }

  async related(symbolName: string): Promise<any> {
    this.ensureMcpConnected();
    const res = await this.mcpClient!.request({
      method: 'related',
      params: { symbolName },
    });
    return res.result;
  }

  private ensureMcpConnected() {
    if (this.status !== 'initialized' || !this.mcpClient) {
      throw new GraphifyUnavailable('McpClient is not initialized or connected.');
    }
  }

  // --- Telemetria e Monitoramento de Saúde ---

  getHealth(): GraphifyHealth {
    const mcpHealth = this.mcpClient?.getHealth();
    const procHealth = this.processManager?.health();

    return {
      configured: !!this.config.workspaceRoot && !!this.config.graphLocation,
      enabled: this.config.enabled,
      reachable: this.status === 'initialized' && (this.mcpClient ? mcpHealth?.connected === true : true),
      providerVersion: '4.0.0-production',
      transport: this.config.transport,
      warnings: [],
      errors: this.config.enabled ? [] : ['Graphify is disabled'],
      // Métricas estendidas integradas requeridas
      processRunning: procHealth?.running ?? false,
      dirtyState: procHealth?.dirty ?? false,
      lastSync: procHealth?.lastSync ?? 0,
      pendingChanges: procHealth?.pendingChanges ?? 0,
      syncDuration: procHealth?.syncDuration ?? 0,
      graphVersion: procHealth?.graphVersion ?? 'none',
      queuedChanges: procHealth?.queuedChanges ?? 0,
    };
  }

  private validateConfiguration(): void {
    if (!this.config.workspaceRoot || this.config.workspaceRoot.trim() === '') {
      throw new GraphifyConfigurationError('workspaceRoot is required.');
    }
    if (!this.config.graphLocation || this.config.graphLocation.trim() === '') {
      throw new GraphifyConfigurationError('graphLocation is required.');
    }
    if (!['mcp', 'stdio', 'ipc', 'stub'].includes(this.config.transport)) {
      throw new GraphifyConfigurationError(`Unsupported transport: ${this.config.transport}`);
    }
  }

  getProcessManager(): GraphProcessManager | undefined {
    return this.processManager;
  }
}
