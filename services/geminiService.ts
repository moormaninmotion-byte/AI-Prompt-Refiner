import { GoogleGenAI, Type } from "@google/genai";
import type { RefinedPromptResponse, ModelConfig } from '../types';

/**
 * System instruction for the prompt refiner model.
 * It guides the AI to act as a prompt engineering expert, refining user input
 * or asking for clarification, and ensuring the output is always in a specific JSON format.
 */
const systemInstruction = `You are an expert prompt engineering assistant. Your goal is to help users refine their initial ideas into clear, effective, and idealized prompts for large language models. Analyze the user's input to understand their core objective. Based on this, you will either:
1. Compose a new, well-structured prompt that is likely to yield the best results.
2. If the user's input is too ambiguous, ask specific, clarifying questions to help them define their goal.

Your response must be in a specific JSON format. Do not add any text outside of the JSON structure. The JSON object must have two properties:
- "refinedPrompt": A string containing the new, idealized prompt. If you are asking a question, this field should be an empty string.
- "rationale": A string explaining your reasoning for the changes or the clarifying questions you are asking.
`;

/**
 * The expected JSON schema for the prompt refinement response.
 * This schema is sent to the model to enforce the structure of its output.
 */
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

/**
 * Calls the Gemini API to refine a user's prompt idea.
 * @param {string} userInput The initial prompt or idea from the user.
 * @param {ModelConfig} modelConfig The configuration for the generative model (temperature, topP, topK).
 * @returns {Promise<RefinedPromptResponse>} A promise that resolves to an object containing the refined prompt and the rationale.
 * @throws {Error} Throws an error if the API call fails or the response is not in the expected format.
 */
export const refinePrompt = async (userInput: string, modelConfig: ModelConfig): Promise<RefinedPromptResponse> => {
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

    // Validate the structure of the parsed JSON response.
    if (typeof parsedResponse.refinedPrompt === 'string' && typeof parsedResponse.rationale === 'string') {
        return parsedResponse;
    } else {
        throw new Error("Invalid JSON structure received from the AI model.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for prompt refinement:", error);
    // Provide a more user-friendly error message.
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to get a valid response from the AI model: ${message}`);
  }
};

/**
 * System instruction for the prompt suggestion model.
 * It instructs the AI to act as a creative assistant, generating a list of related prompt ideas.
 */
const suggestionSystemInstruction = `You are a creative assistant that helps users brainstorm prompt ideas. Based on the user's input, generate a list of 3 to 5 related or alternative prompt suggestions. These suggestions should explore different angles, styles, or subjects related to the original concept. Your response must be a JSON object with a single key "suggestions" which is an array of strings. Do not add any text outside of the JSON structure.
`;

/**
 * The expected JSON schema for the prompt suggestions response.
 */
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

/**
 * Calls the Gemini API to get a list of prompt suggestions based on user input.
 * @param {string} userInput The user's initial idea to base suggestions on.
 * @returns {Promise<string[]>} A promise that resolves to an array of suggestion strings.
 * @throws {Error} Throws an error if the API call fails or the response is malformed.
 */
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
        temperature: 0.8, // Higher temperature for more creative suggestions
        topP: 0.95,
        topK: 40,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    // Validate the structure of the parsed JSON response.
    if (Array.isArray(parsedResponse.suggestions) && parsedResponse.suggestions.every((s: any) => typeof s === 'string')) {
        return parsedResponse.suggestions;
    } else {
        throw new Error("Invalid JSON structure for suggestions received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to get suggestions from the AI model: ${message}`);
  }
};

/**
 * Calls the Gemini API to generate a sample response for a given prompt.
 * This is used to demonstrate the potential output of both the original and refined prompts.
 * @param {string} prompt The prompt to generate a response for.
 * @returns {Promise<string>} A promise that resolves to the generated text.
 * @throws {Error} Throws an error if the API call fails.
 */
export const generateDemonstration = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    return "No prompt was provided to demonstrate.";
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        // Set a token limit to keep demonstrations concise.
        maxOutputTokens: 250, 
        thinkingConfig: { thinkingBudget: 125 }
      }
    });

    return response.text.trim();
  } catch (error) {
     console.error("Error calling Gemini API for demonstration:", error);
     const message = error instanceof Error ? error.message : "An unknown error occurred.";
     throw new Error(`Failed to generate demonstration from the AI model: ${message}`);
  }
};
