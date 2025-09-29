
import type { AiServiceCost } from './types';

export const TOKEN_CALC_FACTOR = 4; // 1 token ~= 4 characters for English text

export const AI_SERVICES: AiServiceCost[] = [
  { name: 'Gemini 2.5 Flash', inputCostPer1kTokens: 0.000035, outputCostPer1kTokens: 0.000105 },
  { name: 'OpenAI GPT-4o', inputCostPer1kTokens: 0.005, outputCostPer1kTokens: 0.015 },
  { name: 'Claude 3.5 Sonnet', inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0.015 },
];

export const PROMPT_TEMPLATES = [
    {
        title: "Write a blog post about...",
        template: "Write a 500-word blog post about [Your Topic Here]. The tone should be [e.g., informative, casual, professional] and the target audience is [e.g., beginners, experts, general audience]."
    },
    {
        title: "Explain a complex topic simply",
        template: "Explain [Complex Topic, e.g., Quantum Computing] to a [Target Audience, e.g., 10-year-old child] using a simple analogy."
    },
    {
        title: "Summarize a block of text",
        template: "Summarize the following text into three key bullet points: [Paste Text Here]"
    },
    {
        title: "Generate a code snippet",
        template: "Write a function in [Programming Language, e.g., Python] that [Describe Functionality, e.g., reverses a string]."
    },
    {
        title: "Create a social media post",
        template: "Create a short, engaging Twitter post to promote [Product or Event]. Include relevant hashtags."
    },
    {
        title: "Brainstorm ideas for...",
        template: "Brainstorm 5 creative ideas for [Your Goal, e.g., a new mobile app for language learning]."
    }
];
