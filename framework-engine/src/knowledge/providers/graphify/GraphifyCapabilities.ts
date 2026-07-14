export const GraphifyCapabilities = {
  semanticSearch: 'semanticSearch',
  dependencyGraph: 'dependencyGraph',
  astLookup: 'astLookup',
  documentLookup: 'documentLookup',
  relatedFiles: 'relatedFiles',
  symbolLookup: 'symbolLookup',
  referenceLookup: 'referenceLookup',
} as const;

export type GraphifyCapability = typeof GraphifyCapabilities[keyof typeof GraphifyCapabilities];

export function isCapabilitySupported(capability: string): boolean {
  return Object.values(GraphifyCapabilities).includes(capability as any);
}
