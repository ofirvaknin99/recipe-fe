
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { Recipe } from '../types';
import { recipeLocalStorageService } from '../services/recipeLocalStorageService';
import { AlertTriangle } from 'lucide-react';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeToEdit = id ? recipeLocalStorageService.getRecipeById(id) : undefined;

  const handleSaveRecipe = (recipe: Recipe) => {
    if (id) {
      recipeLocalStorageService.updateRecipe(id, recipe);
    }
  };

  if (!recipeToEdit) {
    return (
      <div className="text-center py-10 bg-slate-800 rounded-xl shadow-lg">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-xl text-red-400">Recipe not found.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-400 mb-6">Edit Recipe</h1>
      <RecipeForm initialRecipe={recipeToEdit} onSave={handleSaveRecipe} isEditing={true} />
    </div>
  );
};

export default EditRecipePage;
