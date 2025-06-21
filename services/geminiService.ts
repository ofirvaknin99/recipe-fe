
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { ExtractedRecipeParts } from "../types";

// API Key from Vite environment variables (must be prefixed with VITE_)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Gemini API key (VITE_GEMINI_API_KEY) is not set. Gemini features will not work. Ensure it's in your .env file (e.g., VITE_GEMINI_API_KEY=yourkey) or set in your hosting provider's environment variables.");
}

// Initialize the GoogleGenAI client only if API_KEY is available
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const extractRecipePartsFromText = async (description: string): Promise<ExtractedRecipeParts | null> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Please set your VITE_GEMINI_API_KEY.");
  }
  if (!description || description.trim() === "") {
    console.warn("Description is empty, skipping Gemini processing.");
    return {
        ingredients: [],
        steps: [],
        extractedNotes: "",
        suggestedTitle: "",
        // thumbnailPrompt: "" // Removed
    };
  }

  const prompt = `
    Analyze the following recipe description and extract the ingredients, preparation steps, any additional notes, and a suggested title.
    
    Your response MUST be a single, valid JSON object.
    The JSON object MUST conform to the following structure:
    {
      "ingredients": [
        { "id": "string", "name": "string", "quantity": "string (original)", "quantityMetric": "string (e.g., 240ml, 120g, or empty if not applicable/convertible)" }
      ],
      "steps": [
        "string"
      ],
      "extractedNotes": "string",
      "suggestedTitle": "string (Concise and appealing recipe title based on the content)"
    }

    Details for extraction:
    - For each ingredient:
        - Provide an "id" (a unique string you generate).
        - Provide "name" and "quantity" as extracted.
        - If "quantity" contains units like ounces (oz), pounds (lb), cups, tablespoons (tbsp), teaspoons (tsp), convert them to metric equivalents (grams for solids/powders, milliliters for liquids) and place this in "quantityMetric". Examples: '1 cup flour' -> quantityMetric '120g'; '8 oz chicken' -> quantityMetric '227g'; '1 tbsp oil' -> quantityMetric '15ml'.
        - If conversion is not applicable (e.g., '2 carrots', '1 pinch of salt', 'to taste') or impossible, "quantityMetric" should be an empty string or omitted.
    - "ingredients" must be an array of objects. If no ingredients are found, it must be an empty array.
    - "steps" must be an array of strings. If no steps are found, it must be an empty array.
    - "extractedNotes" must be a single string. If no specific notes are found, this can be an empty string.
    - "suggestedTitle" should be a catchy, relevant title for the recipe. If no suitable title can be derived, provide a generic one like "Extracted Recipe".
    - If the input text does not appear to be a recipe: "ingredients" and "steps" must be empty arrays. "extractedNotes" should explain this. "suggestedTitle" can be "Not a Recipe".


    Recipe Description:
    ---
    ${description}
    ---

    CRITICAL INSTRUCTIONS:
    1.  Your entire response MUST be a single, valid JSON object and nothing else.
    2.  The JSON object MUST strictly adhere to the structure shown in the example above.
    3.  DO NOT include ANY text, comments, markdown, code snippets (e.g., 'attr_reader :thought'), dialogue, explanations, or any characters whatsoever outside of the JSON object itself.
    4.  The response MUST begin with '{' and MUST end with '}'. No prefixes, no suffixes, no conversational remarks before or after the JSON.
    5.  Ensure all strings within the JSON are properly escaped if they contain special characters.
    6.  DO NOT output any internal thoughts or processing markers within the JSON structure.
    7.  After any JSON value (string, number, boolean, array, object), the ONLY valid characters that may follow are:
        a. A comma (,) if it is an element in an array or a key-value pair in an object, and it is NOT the last element/pair.
        b. A closing curly brace (}) if it is the end of an object.
        c. A closing square bracket (]) if it is the end of an array.
        Absolutely NO other text, characters, or symbols are permitted after a JSON value before one of these required structural characters.
  `;

  let geminiAPIResponse: GenerateContentResponse | undefined;
  let jsonOutputStr: string = "";

  try {
    geminiAPIResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.1, 
        }
    });

    jsonOutputStr = geminiAPIResponse.text.trim();
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonOutputStr.match(fenceRegex);
    if (match && match[1]) {
      jsonOutputStr = match[1].trim();
    }
    
    const firstBrace = jsonOutputStr.indexOf('{');
    const lastBrace = jsonOutputStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonOutputStr = jsonOutputStr.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonOutputStr) as Partial<ExtractedRecipeParts>;

    const ingredients = (parsed.ingredients || []).map((ing: any) => ({
        id: ing.id || generateUniqueId(),
        name: ing.name || "",
        quantity: ing.quantity || "",
        quantityMetric: ing.quantityMetric || "" 
    })).filter(ing => ing.name && typeof ing.name === 'string');

    const steps = (parsed.steps || []).filter(step => typeof step === 'string' && step.trim() !== "");
    const extractedNotes = typeof parsed.extractedNotes === 'string' ? parsed.extractedNotes.trim() : "";
    const suggestedTitle = typeof parsed.suggestedTitle === 'string' ? parsed.suggestedTitle.trim() : "";
    
    return {
        ingredients,
        steps,
        extractedNotes,
        suggestedTitle,
    };

  } catch (error) {
    console.error("Error calling Gemini API or parsing response for recipe parts. Raw text:\n", geminiAPIResponse?.text);
    console.error("Processed JSON string attempt for recipe parts:\n", jsonOutputStr);
    console.error("Error details for recipe parts:\n", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred with the AI service during recipe part extraction.";
    throw new Error(`Failed to extract recipe parts with AI: ${errorMessage}`);
  }
};

// generateImageWithImagen function removed

export const geminiService = {
  extractRecipePartsFromText,
  // generateImageWithImagen, // Removed
};