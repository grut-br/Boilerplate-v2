import type { KnowledgeConfiguration } from './KnowledgeConfiguration.ts';
import { KnowledgeContext } from './KnowledgeContext.ts';
import { KnowledgeNotInitialized } from './KnowledgeErrors.ts';
import type { KnowledgeRequest } from './contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from './contracts/KnowledgeResult.ts';
import { KnowledgeComposer } from './composition/KnowledgeComposer.ts';
import type { SelectionOptions } from './composition/KnowledgeSelection.ts';
import { KnowledgeResolver } from './resolver/KnowledgeResolver.ts';
import type { KnowledgeResolutionStrategy } from './resolver/KnowledgeResolutionStrategy.ts';
import { GraphManager } from './graph/GraphManager.ts';
import { SemanticCache } from './cache/SemanticCache.ts';
import { ContextCompressor } from './compression/ContextCompressor.ts';
import type { CompressionResult } from './compression/CompressionResult.ts';
import type { ContextCompressorOptions } from './compression/ContextCompressor.ts';
import { QueryPlanner } from './planner/QueryPlanner.ts';
import type { QueryPlannerOptions } from './planner/QueryPlanner.ts';
import { AstProjectionEngine } from './ast/AstProjectionEngine.ts';
import type { AstProjectionEngineOptions } from './ast/AstProjectionEngine.ts';
import { PromptAssembler } from '../prompt/PromptAssembler.ts';
import { PromptSection } from '../prompt/PromptSection.ts';
import type { PromptAssemblerOptions } from '../prompt/PromptAssembler.ts';

export class KnowledgeEngine {
  private config: KnowledgeConfiguration;
  private context: KnowledgeContext | null = null;
  private status: 'idle' | 'initialized' | 'shutdown' = 'idle';
  private readonly version = '4.0.0';
  private readonly composer: KnowledgeComposer;
  private readonly graphManager: GraphManager;
  private readonly cache: SemanticCache;
  private readonly compressor: ContextCompressor;
  private readonly planner: QueryPlanner;
  private readonly astEngine: AstProjectionEngine;
  private readonly promptAssembler: PromptAssembler;

  constructor(config: KnowledgeConfiguration) {
    this.config = config;
    this.composer = new KnowledgeComposer();
    this.graphManager = new GraphManager();
    this.cache = new SemanticCache({
      ttl: config.cache === false ? 0 : undefined,
    });
    this.compressor = new ContextCompressor(
      config.futureOptions?.compression as ContextCompressorOptions | undefined
    );
    this.planner = new QueryPlanner(
      config.futureOptions?.planning as QueryPlannerOptions | undefined
    );
    this.astEngine = new AstProjectionEngine(
      config.futureOptions?.astProjection as AstProjectionEngineOptions | undefined
    );
    this.promptAssembler = new PromptAssembler(
      config.futureOptions?.promptAssembly as PromptAssemblerOptions | undefined
    );
  }

  async initialize(): Promise<void> {
    if (this.status === 'initialized') {
      return;
    }

    if (this.config.provider && this.config.provider.initialize) {
      await this.config.provider.initialize();
    }

    this.graphManager.initialize();
    this.context = new KnowledgeContext(this.config);
    this.status = 'initialized';
  }

  async shutdown(): Promise<void> {
    if (this.status !== 'initialized') {
      return;
    }

    if (this.config.provider && this.config.provider.shutdown) {
      await this.config.provider.shutdown();
    }

    if (this.context) {
      this.context.status = 'shutdown';
    }
    this.status = 'shutdown';
  }

  getStatus(): 'idle' | 'initialized' | 'shutdown' {
    return this.status;
  }

  getVersion(): string {
    return this.version;
  }

  getContext(): KnowledgeContext {
    if (!this.context || this.status !== 'initialized') {
      throw new KnowledgeNotInitialized();
    }
    return this.context;
  }

  getGraphManager(): GraphManager {
    return this.graphManager;
  }

  getCache(): SemanticCache {
    return this.cache;
  }

  /**
   * Retorna o ContextCompressor configurado nesta engine.
   * Permite inspecionar métricas de compressão após consultas.
   */
  getCompressor(): ContextCompressor {
    return this.compressor;
  }

  /**
   * Retorna o QueryPlanner configurado nesta engine.
   * Permite inspecionar o planejamento estratégico das consultas.
   */
  getPlanner(): QueryPlanner {
    return this.planner;
  }

  /**
   * Retorna o AstProjectionEngine configurado nesta engine.
   * Permite inspecionar o motor de projeção de AST de código.
   */
  getAstEngine(): AstProjectionEngine {
    return this.astEngine;
  }

  /**
   * Retorna o PromptAssembler configurado nesta engine.
   * Permite inspecionar a geração e otimização de prompts.
   */
  getPromptAssembler(): PromptAssembler {
    return this.promptAssembler;
  }

  async query(
    request: KnowledgeRequest,
    selectionOptions?: SelectionOptions,
    resolverStrategy?: KnowledgeResolutionStrategy
  ): Promise<KnowledgeResult> {
    if (this.status !== 'initialized' || !this.context) {
      throw new KnowledgeNotInitialized();
    }

    const startedAt = Date.now();

    // 0. Query Planning - Gera o plano de consulta antes de executar a busca
    const plan = this.planner.createPlan(request, {
      workspace: this.config.workspace,
      availableProviders: [this.config.provider.id],
    });

    // 1. Try get from Semantic Cache
    if (this.config.cache) {
      const cachedResult = this.cache.get(request, this.config.provider.id);
      if (cachedResult) {
        this.context.queryCount++;
        this.context.totalDuration += Date.now() - startedAt;
        
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cacheHit: true,
            queryPlan: plan,
          }
        };
      }
    }

    const result = await this.config.provider.query(request);

    const composed = this.composer.compose(
      [{ providerId: this.config.provider.id, result }],
      selectionOptions
    );

    const resolver = new KnowledgeResolver(resolverStrategy);
    const resolvedResult = resolver.resolve(composed, 1);

    // 1.5. AST Projections - Executa projeções na AST se filters.targetSymbol estiver configurado
    const targetSymbol = request.filters?.targetSymbol;
    let finalResolvedResult = resolvedResult;

    if (targetSymbol && resolvedResult.nodes.length > 0) {
      const sourceNodes: Record<string, any> = {};
      resolvedResult.nodes.forEach(node => {
        sourceNodes[node.id] = {
          id: node.id,
          kind: node.type,
          identifier: node.properties.identifier ?? node.id,
          file: node.properties.file ?? 'unknown',
          range: node.properties.range ?? { startLine: 1, startColumn: 1, endLine: 1, endColumn: 1 },
          parent: node.properties.parent,
          children: node.properties.children ?? [],
          references: node.properties.references ?? [],
          priority: node.properties.priority ?? 50,
          weight: node.properties.weight ?? 10,
          content: node.properties.content,
        };
      });

      try {
        const projectionResult = this.astEngine.project(sourceNodes, targetSymbol);
        
        const projectedNodes = Object.values(projectionResult.projection.nodes).map(astNode => ({
          id: astNode.id,
          type: astNode.kind,
          properties: {
            identifier: astNode.identifier,
            file: astNode.file,
            range: astNode.range,
            parent: astNode.parent,
            children: astNode.children,
            references: astNode.references,
            priority: astNode.priority,
            weight: astNode.weight,
            content: astNode.content,
          },
          metadata: {
            projected: true,
          }
        }));

        finalResolvedResult = {
          ...resolvedResult,
          nodes: projectedNodes,
          diagnostics: {
            ...resolvedResult.diagnostics,
            astProjection: projectionResult.projection,
          }
        };
      } catch (err) {
        if (err instanceof Error && err.name === 'AstProjectionPolicyViolation') {
          throw err;
        }
      }
    }

    // 2. Context Compression — reduz volume antes do Prompt Assembly
    const compressionOptions: ContextCompressorOptions =
      (this.config.futureOptions?.compression as ContextCompressorOptions | undefined) ?? {};

    const compressionResult: CompressionResult = this.compressor.compress(
      finalResolvedResult,
      compressionOptions
    );

    const finalResult: KnowledgeResult = {
      ...compressionResult.result,
      diagnostics: {
        ...compressionResult.result.diagnostics,
        queryPlan: plan,
      }
    };

    // 3. Prompt Assembly V2 - Gera o prompt estruturado e otimizado no orçamento
    const sections: PromptSection[] = [];

    sections.push(new PromptSection({
      name: 'System',
      content: 'Você é um assistente de IA focado em engenharia de software.',
    }));

    sections.push(new PromptSection({
      name: 'Task',
      content: request.query,
    }));

    sections.push(new PromptSection({
      name: 'Rules',
      content: request.capability
        ? `Preserve regras obrigatórias para a capability "${request.capability}".`
        : 'Siga as diretrizes de codificação padrão e de qualidade estabelecidas para o projeto.',
    }));

    if (finalResult.documents.length > 0) {
      const docContents = finalResult.documents.map(doc => {
        return `### Documento: ${doc.path}\n\n${doc.content}`;
      }).join('\n\n');
      sections.push(new PromptSection({
        name: 'Context',
        content: docContents,
      }));
    }

    if (finalResult.nodes.length > 0) {
      const nodeContents = finalResult.nodes.map(node => {
        return `### Símbolo AST: ${node.properties.identifier} (Tipo: ${node.type})\nArquivo: ${node.properties.file}\nCódigo:\n${node.properties.content ?? '// sem conteúdo'}`;
      }).join('\n\n');
      sections.push(new PromptSection({
        name: 'Architecture',
        content: nodeContents,
      }));
    }

    const assemblyResult = this.promptAssembler.assemble(sections);

    const finalResultWithPrompt: KnowledgeResult = {
      ...finalResult,
      diagnostics: {
        ...finalResult.diagnostics,
        promptText: assemblyResult.promptText,
        promptSnapshot: assemblyResult.snapshot,
        promptMetrics: assemblyResult.metrics,
      }
    };

    if (this.config.cache) {
      this.cache.put(request, finalResultWithPrompt, this.config.provider.id);
    }

    this.context.queryCount++;
    this.context.totalDuration += Date.now() - startedAt;

    return finalResultWithPrompt;
  }
}
