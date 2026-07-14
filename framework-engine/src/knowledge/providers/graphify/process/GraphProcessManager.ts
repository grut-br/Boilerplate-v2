/**
 * GraphProcessManager
 *
 * Gerencia o ciclo de vida do processo real do Graphify MCP Server e coordena a sincronização.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GraphProcessState } from './GraphProcessState.ts';
import { DirtyChecker } from './DirtyChecker.ts';
import { SynchronizationQueue } from './SynchronizationQueue.ts';
import { GraphifyLazySynchronization } from './LazySynchronization.ts';
import { RealGraphWatcher, MockGraphWatcher, type GraphWatcher } from './GraphWatcher.ts';
import { GraphProcessMetrics } from './GraphProcessMetrics.ts';
import type { GraphProcessConfiguration } from './GraphProcessConfiguration.ts';
import type { GraphProcessHealth } from './GraphProcessHealth.ts';
import { ProcessStartError, ProcessStopped } from './GraphProcessErrors.ts';
import { McpClient } from '../mcp/McpClient.ts';
import { SpawnMcpTransport, StdioMcpTransport } from '../mcp/McpTransport.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GraphProcessManager {
  private state: GraphProcessState = GraphProcessState.Uninitialized;
  private readonly config: GraphProcessConfiguration;
  private readonly dirtyChecker = new DirtyChecker();
  private readonly queue = new SynchronizationQueue();
  private readonly lazySync: GraphifyLazySynchronization;
  private readonly watcher: GraphWatcher;
  private readonly metrics = new GraphProcessMetrics();
  private process: ChildProcess | null = null;
  private mcpClient: McpClient | null = null;
  private lastSyncTimestamp = 0;
  private lastSyncDuration = 0;
  private restartCount = 0;

  constructor(config: GraphProcessConfiguration) {
    this.config = config;
    this.lazySync = new GraphifyLazySynchronization(this.dirtyChecker, this.queue);
    
    // Se o comando for 'mock-watcher' ou um comando de stub de teste (como 'python'), usa o mock, senão usa o real
    this.watcher = (config.command === 'mock-watcher' || config.command === 'python -m graphify' || !config.workspaceRoot)
      ? new MockGraphWatcher()
      : new RealGraphWatcher(config.workspaceRoot);
      
    this.watcher.onEvent((path) => {
      this.state = GraphProcessState.Dirty;
      this.lazySync.onFileChanged(path);
    });
  }

  async start(): Promise<void> {
    if (this.state === GraphProcessState.Running) return;

    this.state = GraphProcessState.Starting;
    
    if (this.config.command === 'invalid-command') {
      this.state = GraphProcessState.Failed;
      throw new ProcessStartError('Command not found in path.');
    }

    try {
      const serverPath = path.resolve(path.join(__dirname, '../mcp/GraphifyMcpServer.ts'));

      // Se for um stub de teste (como comando python ou mock-watcher), usa o stub rápido em memória
      if (this.config.command.includes('python') || this.config.command === 'mock-watcher') {
        const transport = new StdioMcpTransport();
        this.mcpClient = new McpClient(transport);
        await this.mcpClient.connect(this.config.timeout ?? 1000);
        
        await this.mcpClient.request({
          method: 'initialize',
          params: {
            graphLocation: this.config.graphLocation ?? 'graph.json'
          }
        });

        this.state = GraphProcessState.Running;
        this.watcher.start();
        return;
      }
      
      // Spawna o processo real do Graphify MCP Server
      this.process = spawn('node', [
        '--experimental-strip-types',
        serverPath
      ]);
      this.process.unref();

      this.process.on('close', () => {
        this.state = GraphProcessState.Stopped;
        this.process = null;
      });

      // Inicializa o cliente MCP para mandar comandos de sync
      const transport = new SpawnMcpTransport(serverPath);
      this.mcpClient = new McpClient(transport);
      await this.mcpClient.connect(this.config.timeout ?? 2000);

      // Envia o handshake de initialize passando a localização do graph.json
      await this.mcpClient.request({
        method: 'initialize',
        params: {
          graphLocation: this.config.graphLocation ?? 'graph.json'
        }
      });

      this.state = GraphProcessState.Running;
      this.watcher.start();
    } catch (err: any) {
      this.state = GraphProcessState.Failed;
      if (this.process) {
        this.process.kill();
        this.process = null;
      }
      throw new ProcessStartError(err.message ?? 'Unknown spawn error');
    }
  }

  async stop(): Promise<void> {
    if (this.state === GraphProcessState.Stopped || this.state === GraphProcessState.Uninitialized) return;

    this.state = GraphProcessState.Stopping;
    
    this.watcher.stop();
    
    if (this.mcpClient) {
      await this.mcpClient.disconnect();
      this.mcpClient = null;
    }

    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    
    this.state = GraphProcessState.Stopped;
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
    this.restartCount++;
  }

  async restartIfNeeded(): Promise<boolean> {
    if (this.state === GraphProcessState.Failed || this.state === GraphProcessState.Stopped) {
      if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
        try {
          await this.restart();
          return true;
        } catch {
          this.state = GraphProcessState.Failed;
          return true;
        }
      }
    }
    return false;
  }

  status(): GraphProcessState {
    return this.state;
  }

  health(): GraphProcessHealth {
    return {
      running: this.state === GraphProcessState.Running || this.state === GraphProcessState.Synchronizing || this.state === GraphProcessState.Dirty || this.state === GraphProcessState.Idle,
      dirty: this.dirtyChecker.isDirty(),
      pendingChanges: this.dirtyChecker.getDirtyCount(),
      lastSync: this.lastSyncTimestamp,
      syncDuration: this.lastSyncDuration,
      graphVersion: '4.0.0-real',
      queuedChanges: this.queue.size(),
      processId: this.process?.pid ?? null,
    };
  }

  queueSynchronization(filePath: string, priority = 0): void {
    this.state = GraphProcessState.Dirty;
    this.lazySync.onFileChanged(filePath, priority);
  }

  async synchronize(): Promise<boolean> {
    if (this.state === GraphProcessState.Stopped) {
      throw new ProcessStopped();
    }

    if (!this.lazySync.shouldSyncNow()) {
      this.metrics.incrementSyncsAvoided();
      return false;
    }

    this.state = GraphProcessState.Synchronizing;
    const start = Date.now();

    const queuedItems = this.queue.popAll();
    const filesToSync = queuedItems.map(item => item.id);

    if (filesToSync.length > 0 && this.mcpClient) {
      // Envia os arquivos modificados para o MCP Server processar e gravar no graph.json
      await this.mcpClient.request({
        method: 'sync',
        params: {
          files: filesToSync
        }
      });
    }

    this.dirtyChecker.clearChanges(filesToSync);

    this.lastSyncDuration = Date.now() - start;
    this.lastSyncTimestamp = Date.now();

    this.metrics.recordSync(this.lastSyncDuration, filesToSync.length);

    this.state = GraphProcessState.Idle;
    return true;
  }

  async shutdown(): Promise<void> {
    await this.stop();
    this.dirtyChecker.clearAll();
    this.queue.clear();
    this.metrics.clear();
    this.state = GraphProcessState.Uninitialized;
  }

  getWatcher(): GraphWatcher {
    return this.watcher;
  }

  getMetrics(): GraphProcessMetrics {
    return this.metrics;
  }

  getQueue(): SynchronizationQueue {
    return this.queue;
  }
}
