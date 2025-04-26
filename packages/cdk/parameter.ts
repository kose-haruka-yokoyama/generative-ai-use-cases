import * as cdk from 'aws-cdk-lib';
import {
  StackInput,
  stackInputSchema,
  ProcessedStackInput,
} from './lib/stack-input';
import { ModelConfiguration } from 'generative-ai-use-cases';

// Get parameters from CDK Context
const getContext = (app: cdk.App): StackInput => {
  const params = stackInputSchema.parse(app.node.getAllContext());
  return params;
};

// If you want to define parameters directly
const envs: Record<string, Partial<StackInput>> = {
  dev: {
    modelRegion: 'ap-northeast-1',
    modelIds: [
      'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      'apac.anthropic.claude-3-haiku-20240307-v1:0',
    ],
    imageGenerationModelIds: ['amazon.nova-canvas-v1:0'],
    videoGenerationModelIds: ['amazon.nova-reel-v1:0'],
    ragEnabled: false,
    ragKnowledgeBaseEnabled: true,
    ragKnowledgeBaseAdvancedParsing: true,
    ragKnowledgeBaseAdvancedParsingModelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    // agentEnabledはCode Interpreterなので本当はOnにしたい
    agentEnabled: false,
    searchAgentEnabled: false,
    searchApiKey: '<検索エンジンの API キー>',
    selfSignUpEnabled: false,
    embeddingModelId: 'amazon.titan-embed-text-v2:0',
    rerankingModelId: 'amazon.rerank-v1:0',
    region: 'ap-northeast-1',
    endpointNames: [], // SageMaker エンドポイントを使用しない
  },
};

// For backward compatibility, get parameters from CDK Context > parameter.ts
export const getParams = (app: cdk.App): ProcessedStackInput => {
  // By default, get parameters from CDK Context
  let params = getContext(app);

  // If the env matches the ones defined in envs, use the parameters in envs instead of the ones in context
  if (envs[params.env]) {
    params = stackInputSchema.parse({
      ...envs[params.env],
      env: params.env,
    });
  }
  // Make the format of modelIds, imageGenerationModelIds consistent
  const convertToModelConfiguration = (
    models: (string | ModelConfiguration)[],
    defaultRegion: string
  ): ModelConfiguration[] => {
    return models.map((model) =>
      typeof model === 'string'
        ? { modelId: model, region: defaultRegion }
        : model
    );
  };

  return {
    ...params,
    modelIds: convertToModelConfiguration(params.modelIds, params.modelRegion),
    imageGenerationModelIds: convertToModelConfiguration(
      params.imageGenerationModelIds,
      params.modelRegion
    ),
    videoGenerationModelIds: convertToModelConfiguration(
      params.videoGenerationModelIds,
      params.modelRegion
    ),
  };
};
