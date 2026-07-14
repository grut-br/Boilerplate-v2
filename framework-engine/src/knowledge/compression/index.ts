/**
 * index.ts — Context Compression Engine
 *
 * Exporta todos os componentes públicos da camada de compressão.
 * Posicionada entre os Knowledge Providers e o Prompt Assembly.
 */

export * from './ContextCompressor.ts';
export * from './CompressionPolicy.ts';
export * from './CompressionMetrics.ts';
export * from './CompressionSnapshot.ts';
export * from './CompressionResult.ts';
export * from './CompressionPipeline.ts';
export * from './DuplicateDetector.ts';
export * from './PrioritySelector.ts';
export * from './ContextNormalizer.ts';
export * from './CompressionErrors.ts';
