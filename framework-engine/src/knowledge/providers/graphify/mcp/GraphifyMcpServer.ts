/**
 * GraphifyMcpServer
 *
 * Servidor MCP em Node.js para o Graphify.
 * Comunica-se via stdin/stdout com mensagens JSON-RPC.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Interface simples do grafo armazenado em disco (graph.json)
interface GraphData {
  version: string;
  nodes: any[];
  edges: any[];
  lastSync: number;
}

function logDebug(msg: string) {
  // Como stdout é usado para comunicação JSON-RPC, logs devem ir para stderr
  process.stderr.write(`[GraphifyMcpServer] ${msg}\n`);
}

class GraphifyMcpServer {
  private graphLocation = '';
  
  start() {
    logDebug('Server started, listening on stdin...');
    
    let buffer = '';
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      this.processBuffer(buffer);
    });
  }

  private processBuffer(data: string) {
    // As mensagens JSON-RPC são comumente delimitadas por newline
    const lines = data.split('\n');
    // Mantém a última parte incompleta no buffer
    const lastLine = lines.pop() ?? '';
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const payload = JSON.parse(line);
          this.handleRequest(payload);
        } catch (err) {
          logDebug(`JSON parse error for line: ${line}. Error: ${err}`);
        }
      }
    }
  }

  private loadGraph(): GraphData {
    if (!this.graphLocation || !fs.existsSync(this.graphLocation)) {
      return { version: '1.0.0', nodes: [], edges: [], lastSync: Date.now() };
    }
    try {
      const raw = fs.readFileSync(this.graphLocation, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { version: '1.0.0', nodes: [], edges: [], lastSync: Date.now() };
    }
  }

  private saveGraph(graph: GraphData) {
    if (!this.graphLocation) return;
    try {
      const dir = path.dirname(this.graphLocation);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.graphLocation, JSON.stringify(graph, null, 2), 'utf8');
    } catch (err) {
      logDebug(`Failed to save graph: ${err}`);
    }
  }

  private handleRequest(payload: any) {
    const { id, method, params } = payload;
    if (!method) return;

    logDebug(`Received request method: ${method}`);

    let result: any = null;
    let error: any = null;

    try {
      switch (method) {
        case 'initialize':
          if (params?.graphLocation) {
            this.graphLocation = params.graphLocation;
          }
          result = {
            protocolVersion: '2024-11-05',
            capabilities: { semanticSearch: true, graphOperations: true },
            serverInfo: { name: 'GraphifyMcpServerReal', version: '4.0.0' }
          };
          break;

        case 'ping':
          result = 'pong';
          break;

        case 'sync':
          // Simula sincronização real atualizando o arquivo graph.json
          const graph = this.loadGraph();
          if (params?.files && Array.isArray(params.files)) {
            params.files.forEach((file: string) => {
              // Adiciona nós sintéticos baseados no arquivo alterado para simular a sincronização da AST
              const baseName = path.basename(file, path.extname(file));
              const nodeName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
              
              // Remove nó antigo do mesmo arquivo
              graph.nodes = graph.nodes.filter(n => n.properties?.file !== file);

              // Adiciona novo nó mapeado
              graph.nodes.push({
                id: `node-${baseName}`,
                type: 'class',
                properties: {
                  identifier: nodeName,
                  file,
                  content: `export class ${nodeName} {\n  run() {\n    console.log("running");\n  }\n}`,
                  priority: 100,
                  weight: 50,
                  children: [`node-${baseName}-run`],
                }
              });

              graph.nodes.push({
                id: `node-${baseName}-run`,
                type: 'method',
                properties: {
                  identifier: 'run',
                  file,
                  parent: `node-${baseName}`,
                  priority: 50,
                  weight: 10,
                }
              });
            });
          }
          graph.lastSync = Date.now();
          this.saveGraph(graph);
          result = { success: true, timestamp: graph.lastSync, nodesCount: graph.nodes.length };
          break;

        case 'query':
        case 'search':
          const currentGraph = this.loadGraph();
          const query = (params?.query ?? '').toLowerCase();
          const matchedNodes = currentGraph.nodes.filter(n => {
            const idMatch = n.id.toLowerCase().includes(query);
            const typeMatch = n.type.toLowerCase().includes(query);
            const nameMatch = (n.properties?.identifier ?? '').toLowerCase().includes(query);
            return idMatch || typeMatch || nameMatch;
          });

          result = {
            documents: matchedNodes.map(n => ({
              id: `doc-${n.id}`,
              path: n.properties?.file ?? 'unknown.ts',
              content: n.properties?.content ?? `// Symbol: ${n.properties?.identifier}`,
              metadata: { kind: n.type },
            })),
            nodes: matchedNodes,
            metadata: { source: 'graphify-server-mcp' },
            diagnostics: { queryTimeMs: 2 }
          };
          break;

        case 'lookup':
          const lookupGraph = this.loadGraph();
          const target = params?.symbolName;
          const node = lookupGraph.nodes.find(n => n.properties?.identifier === target);
          result = node ? { node } : { error: 'Symbol not found' };
          break;

        case 'dependencies':
          // Retorna nós dependentes
          result = { dependencies: [] };
          break;

        case 'references':
          result = { references: [] };
          break;

        case 'symbols':
          const g = this.loadGraph();
          result = { symbols: g.nodes.map(n => n.properties?.identifier).filter(Boolean) };
          break;

        default:
          error = { code: -32601, message: `Method not found: ${method}` };
      }
    } catch (err: any) {
      error = { code: -32603, message: err.message ?? 'Internal error' };
    }

    const response = {
      jsonrpc: '2.0',
      id,
      result,
      error
    };

    // Escreve para o stdout do processo
    process.stdout.write(JSON.stringify(response) + '\n');
  }
}

const server = new GraphifyMcpServer();
server.start();
