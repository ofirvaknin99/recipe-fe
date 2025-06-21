export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  quantityMetric?: string; // Added for metric conversion
}

export interface Recipe {
  id:string;
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
  thumbnailUrl: string;
  originalLink: string;
  creatorUsername?: string;
  createdAt: string; // ISO date string
  tags?: string[]; // Added for tags/labels
}

// Data structure for information fetched by reelInfoService from the backend
export interface ReelInfoData {
  title: string;
  description: string;
  creatorUsername: string;
  thumbnailUrl: string;
  originalLink: string;
}

// Data structure for recipe parts extracted by Gemini
export interface ExtractedRecipeParts {
  ingredients: Array<{ id: string; name: string; quantity: string; quantityMetric?: string }>; // Added quantityMetric
  steps: string[];
  extractedNotes: string;
  suggestedTitle?: string; // Added for AI-suggested title
  // thumbnailPrompt?: string; // Removed as AI image generation is being removed
}