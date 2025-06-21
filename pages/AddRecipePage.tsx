
import React from 'react';
import RecipeForm from '../components/RecipeForm';
import { Recipe } from '../types';
import { recipeLocalStorageService } from '../services/recipeLocalStorageService';

const AddRecipePage: React.FC = () => {
  const handleSaveRecipe = (recipe: Recipe) => {
    recipeLocalStorageService.addRecipe(recipe);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-400 mb-6">Add New Recipe</h1>
      <RecipeForm onSave={handleSaveRecipe} />
    </div>
  );
};

export default AddRecipePage;
