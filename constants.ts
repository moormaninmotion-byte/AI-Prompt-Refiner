
import type { AiServiceCost } from './types';

export const TOKEN_CALC_FACTOR = 4; // 1 token ~= 4 characters for English text

export const AI_SERVICES: AiServiceCost[] = [
  { name: 'Gemini 2.5 Flash', inputCostPer1kTokens: 0.000035, outputCostPer1kTokens: 0.000105 },
  { name: 'OpenAI GPT-4o', inputCostPer1kTokens: 0.005, outputCostPer1kTokens: 0.015 },
  { name: 'Claude 3.5 Sonnet', inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0.015 },
];
