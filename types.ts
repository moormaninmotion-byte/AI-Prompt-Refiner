export interface RefinedPromptResponse {
  refinedPrompt: string;
  rationale: string;
}

export interface AiServiceCost {
  name: string;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
}

export interface ModelConfig {
  temperature: number;
  topP: number;
  topK: number;
}

export interface InteractionHistoryItem {
  id: string;
  timestamp: string;
  originalPrompt: string;
  refinedPrompt: string;
  rationale: string;
  modelConfig: ModelConfig;
}
