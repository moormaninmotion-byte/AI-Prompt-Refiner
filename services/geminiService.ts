
import { GoogleGenAI, Type } from "@google/genai";
import type { RefinedPromptResponse, ModelConfig } from '../types';

const systemInstruction = `You are an expert prompt engineering assistant. Your goal is to help users refine their initial ideas into clear, effective, and idealized prompts for large language models. Analyze the user's input to understand their core objective. Based on this, you will either:
1. Compose a new, well-structured prompt that is likely to yield the best results.
2. If the user's input is too ambiguous, ask specific, clarifying questions to help them define their goal.

Your response must be in a specific JSON format. Do not add any text outside of the JSON structure. The JSON object must have two properties:
- "refinedPrompt": A string containing the new, idealized prompt. If you are asking a question, this field should be an empty string.
- "rationale": A string explaining your reasoning for the changes or the clarifying questions you are asking.

Example for a good prompt:
User input: 'make a picture of a space cat'
Your JSON output:
{
  "refinedPrompt": "Generate a photorealistic image of a majestic Siamese cat wearing a retro-style astronaut helmet, floating serenely in the nebula-filled expanse of deep space. The cat's blue eyes should reflect the distant starlight, and the helmet's visor should show a faint reflection of a swirling galaxy. The lighting should be dramatic, with a key light source illuminating one side of the cat.",
  "rationale": "I've added specific details like 'photorealistic', 'majestic Siamese cat', 'retro-style astronaut helmet', and described the background and lighting to create a much more vivid and actionable prompt for an image generation model."
}

Example for an ambiguous prompt:
User input: 'write about business'
Your JSON output:
{
  "refinedPrompt": "",
  "rationale": "The topic 'business' is very broad. To help you, I need a little more information. Could you tell me: What specific aspect of business are you interested in (e.g., marketing, finance, startups)? Who is the target audience for this writing? What is the desired tone (e.g., formal, casual, academic)?"
}
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        refinedPrompt: {
            type: Type.STRING,
            description: "The newly generated, idealized prompt. Empty if asking for clarification."
        },
        rationale: {
            type: Type.STRING,
            description: "Explanation of the changes made or clarifying questions for the user."
        },
    },
    required: ["refinedPrompt", "rationale"],
};


// FIX: Remove apiKey parameter and use environment variable for API key.
export const refinePrompt = async (userInput: string, modelConfig: ModelConfig): Promise<RefinedPromptResponse> => {
  // FIX: API key is now handled by environment variables, so remove the check.
  // if (!apiKey) {
  //   throw new Error("API Key is missing. Please provide a valid API key.");
  // }
  // FIX: Initialize GoogleGenAI with API key from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: modelConfig.temperature,
        topP: modelConfig.topP,
        topK: modelConfig.topK,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (typeof parsedResponse.refinedPrompt === 'string' && typeof parsedResponse.rationale === 'string') {
        return parsedResponse;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

const suggestionSystemInstruction = `You are a creative assistant that helps users brainstorm prompt ideas. Based on the user's input, generate a list of 3 to 5 related or alternative prompt suggestions. These suggestions should explore different angles, styles, or subjects related to the original concept. Your response must be a JSON object with a single key "suggestions" which is an array of strings. Do not add any text outside of the JSON structure.

Example:
User input: 'a cat in space'
Your JSON output:
{
  "suggestions": [
    "A photorealistic image of a ginger tabby cat wearing a vintage astronaut helmet, looking out a spaceship window at a swirling nebula.",
    "An oil painting of a fluffy Persian cat floating weightlessly in a zero-gravity chamber, playfully chasing a laser dot.",
    "Generate a logo for a coffee brand named 'Cosmic Cat Cafe', featuring a stylized cat silhouette against a crescent moon.",
    "Write a short story about a brave feline explorer discovering a new planet populated by friendly aliens."
  ]
}
`;

const suggestionsResponseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "An array of 3-5 alternative or related prompt suggestions."
        },
    },
    required: ["suggestions"],
};

export const getPromptSuggestions = async (userInput: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        systemInstruction: suggestionSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: suggestionsResponseSchema,
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (Array.isArray(parsedResponse.suggestions) && parsedResponse.suggestions.every((s: any) => typeof s === 'string')) {
        return parsedResponse.suggestions;
    } else {
        throw new Error("Invalid JSON structure for suggestions received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    throw new Error("Failed to get a valid response from the AI model for suggestions.");
  }
};
