import { loadConfiguration, ProviderExecutor, ProviderRegistry, registerOpenAIProvider } from '../src/index.ts';
import type { HydratedContext } from '../src/runtime/context/types.ts';

const exampleContext: HydratedContext = {
  sections: {
    systemPrompt: 'You are the Framework Engine execution system.',
    capabilityPrompt: 'Answer the task using the supplied context.',
    rules: '',
    knowledge: '',
    specification: '',
    workflows: '',
    templates: '',
    adrs: '',
    task: 'Return one short sentence confirming that the OpenAI adapter is reachable.',
    finalPayload: [
      '## SYSTEM PROMPT\nYou are the Framework Engine execution system.',
      '## CAPABILITY PROMPT\nAnswer the task using the supplied context.',
      '## TASK\nReturn one short sentence confirming that the OpenAI adapter is reachable.',
    ].join('\n\n'),
  },
  documents: [],
  snapshot: {
    loadedFiles: [],
    discardedFiles: [],
    estimatedTokens: 0,
    budgetUsed: 0,
    capability: 'openai-example',
    hydrationTimeMs: 0,
    warnings: [],
    statistics: {
      maxTokens: 4000,
      usedTokens: 0,
      discardedTokens: 0,
      loadedDocuments: 0,
      discardedDocuments: 0,
      requiredDocuments: 0,
      optionalDocuments: 0,
    },
  },
};

async function main(): Promise<void> {
  const configuration = loadConfiguration();
  const apiKey = configuration.openai.apiKey?.trim();
  if (!apiKey) {
    console.log('OPENAI_API_KEY is not set. No OpenAI request was made.');
    return;
  }

  const registry = new ProviderRegistry();
  registerOpenAIProvider(registry, configuration);
  const result = await new ProviderExecutor(registry, configuration).executeContextPipeline(exampleContext, {}, {
    requestId: 'openai-example',
  });

  console.log(JSON.stringify({
    success: result.success,
    provider: result.provider,
    response: result.response?.content,
    metrics: result.metrics,
    error: result.error,
  }, null, 2));
  if (!result.success) {
    process.exitCode = 1;
  }
}

void main();
