import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe, Ingredient, ReelInfoData, ExtractedRecipeParts } from '../types';
import { PlusCircle, Trash2, Send, DownloadCloud, Sparkles, Image as ImageIcon, AlertTriangle as AlertTriangleIcon, X as XIcon, Tag } from 'lucide-react';
// Removed RefreshCw as AI image re-generation is removed
import { reelInfoService } from '../services/reelInfoService';
import { geminiService } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface RecipeFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  isEditing?: boolean;
}

const generateClientUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSave, isEditing = false }) => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [originalLink, setOriginalLink] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  
  // Removed AI image generation state
  // const [currentThumbnailPrompt, setCurrentThumbnailPrompt] = useState<string | null>(null);
  // const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  // const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [textProcessingError, setTextProcessingError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRecipe) {
      setTitle(initialRecipe.title);
      setIngredients(initialRecipe.ingredients.length > 0 ? initialRecipe.ingredients : [{ id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
      setSteps(initialRecipe.steps.length > 0 ? initialRecipe.steps : ['']);
      setNotes(initialRecipe.notes || '');
      setThumbnailUrl(initialRecipe.thumbnailUrl);
      setOriginalLink(initialRecipe.originalLink);
      setCreatorUsername(initialRecipe.creatorUsername || '');
      setTags(initialRecipe.tags || []);
      // setCurrentThumbnailPrompt(null); // Removed
    }
  }, [initialRecipe]);

  const handleIngredientChange = (index: number, field: keyof Omit<Ingredient, 'id'>, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    } else {
      setIngredients([{ id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
     if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    } else {
      setSteps(['']);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTagInput(e.target.value);
  };

  const handleAddTag = () => {
    const newTag = currentTagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setCurrentTagInput('');
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // triggerImageGeneration function removed

  const populateFormWithFetchedData = useCallback(async (data: ReelInfoData, processWithAI: boolean) => {
    setTitle(data.title || 'Recipe from Reel');
    setNotes(data.description || 'No description fetched. Add notes manually.');
    setThumbnailUrl(data.thumbnailUrl || ''); 
    setOriginalLink(data.originalLink || originalLink); // Keep originalLink if already set
    setCreatorUsername(data.creatorUsername || '');
    
    setIngredients([{ id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
    setSteps(['']);
    setTags([]); // Reset tags when fetching new reel
    // setCurrentThumbnailPrompt(null); // Removed

    if (processWithAI && data.description && data.description.trim() !== "") {
      setIsProcessingText(true);
      setTextProcessingError(null);
      try {
        const extractedParts = await geminiService.extractRecipePartsFromText(data.description);
        if (extractedParts) {
          setTitle(extractedParts.suggestedTitle || data.title || 'AI Suggested Recipe');
          setIngredients(extractedParts.ingredients.length > 0 ? extractedParts.ingredients.map(ing => ({...ing, id: ing.id || generateClientUniqueId() })) : [{ id: generateClientUniqueId(), name: '', quantity: '', quantityMetric: '' }]);
          setSteps(extractedParts.steps.length > 0 ? extractedParts.steps : ['']);
          
          if (extractedParts.extractedNotes && extractedParts.extractedNotes.length > 20) {
             setNotes(`Original Description:\n${data.description}\n\nAI Extracted Notes:\n${extractedParts.extractedNotes}`);
          } else {
             setNotes(data.description);
          }

          // AI image generation logic removed
          // if (extractedParts.thumbnailPrompt) {
          //   setCurrentThumbnailPrompt(extractedParts.thumbnailPrompt);
          //   await triggerImageGeneration(extractedParts.thumbnailPrompt);
          // } else {
          //    setIsGeneratingImage(false);
          //    setImageGenerationError(null);
          // }
        }
      } catch (aiError) {
        console.error("AI text processing error:", aiError);
        const message = aiError instanceof Error ? aiError.message : "An unknown error occurred during AI processing.";
        setTextProcessingError(`Error processing description with AI: ${message}. You can edit manually.`);
        setNotes(data.description || "Failed to process description with AI.");
      } finally {
        setIsProcessingText(false);
      }
    } else if (!data.description || data.description.trim() === "") {
        setNotes(data.description || "No description was found in the fetched data to process with AI.");
    }
  }, [originalLink]); // Added originalLink to dependencies for useCallback

  const handleFetchReelInfo = async () => {
    if (!originalLink) {
      setDataError("Please enter an Instagram Reel link first.");
      return;
    }

    setIsLoadingData(true);
    setDataError(null);
    setTextProcessingError(null);
    // setImageGenerationError(null); // Removed
    // setIsGeneratingImage(false); // Removed

    try {
      const reelData = await reelInfoService.fetchReelInfo(originalLink);
      if (reelData) {
        await populateFormWithFetchedData(reelData, true); 
      } else {
        setDataError("Could not fetch reel data. Please try again or fill manually.");
      }
    } catch (error) {
      console.error("Reel data fetch error:", error);
      setDataError(error instanceof Error ? error.message : "An unknown error occurred while fetching reel data.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalIngredients = ingredients.filter(ing => ing.name.trim() !== '' || ing.quantity.trim() !== '');
    const finalSteps = steps.filter(step => step.trim() !== '');

    const recipe: Recipe = {
      id: initialRecipe?.id || generateClientUniqueId(),
      title: title.trim() || 'Untitled Recipe',
      ingredients: finalIngredients.length > 0 ? finalIngredients.map(ing => ({...ing, id: ing.id || generateClientUniqueId(), quantityMetric: ing.quantityMetric || ''})) : [],
      steps: finalSteps.length > 0 ? finalSteps : [],
      notes: notes.trim(),
      thumbnailUrl: thumbnailUrl.trim() || `https://picsum.photos/seed/${Date.now()}/400/300`,
      originalLink: originalLink.trim(),
      creatorUsername: creatorUsername.trim(),
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
      tags: tags.filter(tag => tag.trim() !== ''),
    };
    onSave(recipe);
    navigate('/');
  };

  const inputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-400 text-slate-100";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";
  const buttonClass = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors";

  const totalLoading = isLoadingData || isProcessingText; // Removed isGeneratingImage

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl">
      <div>
        <label htmlFor="originalLink" className={labelClass}>Instagram Reel Link</label>
        <div className="flex flex-col sm:flex-row gap-2">
            <input
            type="url"
            id="originalLink"
            value={originalLink}
            onChange={(e) => {
                setOriginalLink(e.target.value);
                setDataError(null); 
                setTextProcessingError(null);
                // setImageGenerationError(null); // Removed
            }}
            className={inputClass}
            placeholder="https://www.instagram.com/reel/..."
            />
            <button
                type="button"
                onClick={handleFetchReelInfo}
                disabled={totalLoading}
                className={`${buttonClass} bg-sky-600 hover:bg-sky-500 text-white w-full sm:w-auto whitespace-nowrap ${totalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Fetch info & process with AI"
            >
                {isLoadingData ? <><LoadingSpinner size="sm" /> Fetching...</> : 
                 isProcessingText ? <><LoadingSpinner size="sm" /> AI Processing...</> : 
                 // isGeneratingImage ? <><LoadingSpinner size="sm" /> Gen Thumbnail...</> : // Removed
                 <><DownloadCloud size={18} className="mr-2" /> Fetch & AI Process</>}
            </button>
        </div>
        {dataError && <p className="text-sm text-red-400 mt-1">{dataError}</p>}
        {textProcessingError && <p className="text-sm text-orange-400 mt-1">{textProcessingError}</p>}
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>Recipe Title (AI Assisted)</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="E.g., Delicious Chocolate Cake"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="thumbnailUrl" className={labelClass}>Thumbnail Image URL</label>
            <div className="flex items-center gap-2">
                <input
                    type="url"
                    id="thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className={inputClass}
                    placeholder="Enter image URL or leave blank for default"
                />
                {/* Re-generate AI Thumbnail button removed */}
            </div>

            {/* AI Image generation error message removed */}
            {/* {imageGenerationError && <p className="text-sm text-red-400 mt-1 flex items-center"><AlertTriangleIcon size={16} className="mr-1" /> {imageGenerationError}</p>} */}
            
            {thumbnailUrl && (thumbnailUrl.startsWith('data:image') || thumbnailUrl.startsWith('http')) && (
                <div className="mt-2">
                    <img src={thumbnailUrl} alt="Thumbnail Preview" className="rounded-lg max-h-48 w-auto shadow-md" />
                </div>
            )}
             {(!thumbnailUrl && !totalLoading) && ( // Simplified condition
                 <div className="mt-2 p-4 bg-slate-700 rounded-lg text-center text-slate-400">
                    <ImageIcon size={32} className="mx-auto mb-1"/>
                    Thumbnail preview will appear here.
                 </div>
             )}
        </div>
        <div>
            <label htmlFor="creatorUsername" className={labelClass}>Creator Username</label>
            <input
            type="text"
            id="creatorUsername"
            value={creatorUsername}
            onChange={(e) => setCreatorUsername(e.target.value)}
            className={inputClass}
            placeholder="@chef_master or fetched"
            />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>Tags (e.g., vegan, quick, dessert)</label>
        <div className="flex items-center gap-2">
            <input
                type="text"
                id="tags"
                value={currentTagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className={inputClass}
                placeholder="Type a tag and press Enter or ,"
            />
            <button
                type="button"
                onClick={handleAddTag}
                className={`${buttonClass} bg-indigo-600 hover:bg-indigo-500 text-white`}
            >
                <Tag size={18} className="mr-2"/> Add Tag
            </button>
        </div>
        {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
                <span key={index} className="flex items-center bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {tag}
                <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 text-sky-200 hover:text-white"
                    aria-label={`Remove tag ${tag}`}
                >
                    <XIcon size={14} />
                </button>
                </span>
            ))}
            </div>
        )}
      </div>


      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <Sparkles size={20} className="mr-2 text-yellow-400" /> Ingredients (AI Assisted)
        </h3>
        {ingredients.map((ing, index) => (
          <div key={ing.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mb-2 items-center">
            <input
              type="text"
              value={ing.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              className={`${inputClass}`}
              placeholder="Ingredient Name (e.g., Flour)"
            />
            <div className="flex gap-2">
                <input
                type="text"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                className={`${inputClass} w-full sm:w-40`}
                placeholder="Original Qty"
                title="Original Quantity"
                />
                <input
                type="text"
                value={ing.quantityMetric}
                onChange={(e) => handleIngredientChange(index, 'quantityMetric', e.target.value)}
                className={`${inputClass} w-full sm:w-32`}
                placeholder="Metric Qty"
                title="Metric Quantity (e.g., 120g, 240ml)"
                />
            </div>
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className={`${buttonClass} bg-red-600 hover:bg-red-500 text-white aspect-square`}
              aria-label="Remove ingredient"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white text-sm mt-1`}
        >
          <PlusCircle size={18} className="mr-2" /> Add Ingredient
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
             <Sparkles size={20} className="mr-2 text-yellow-400" /> Preparation Steps (AI Assisted)
        </h3>
        {steps.map((step, index) => (
          <div key={index} className="flex gap-2 mb-2 items-start">
            <span className="pt-3 text-slate-400 font-semibold">{index + 1}.</span>
            <textarea
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              className={`${inputClass} h-24 resize-y`}
              placeholder="Describe this step"
              rows={3}
            />
            <button
              type="button"
              onClick={() => removeStep(index)}
              className={`${buttonClass} bg-red-600 hover:bg-red-500 text-white mt-1 aspect-square`}
              aria-label="Remove step"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white text-sm mt-1`}
        >
          <PlusCircle size={18} className="mr-2" /> Add Step
        </button>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes & Original Description</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} h-36 resize-y`}
          placeholder="Extracted description, AI notes, tips, or your personal notes"
          rows={6}
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className={`${buttonClass} bg-sky-600 hover:bg-sky-500 text-white text-lg w-full sm:w-auto min-w-[150px] ${ totalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={totalLoading}
        >
          <Send size={20} className="mr-2" /> {isEditing ? 'Save Changes' : 'Add Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;