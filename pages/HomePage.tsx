import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Recipe } from '../types';
import { recipeLocalStorageService } from '../services/recipeLocalStorageService';
import { PlusCircle, Search, Frown } from 'lucide-react';

const HomePage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const fetchRecipes = useCallback(() => {
    setIsLoading(true);
    const storedRecipes = recipeLocalStorageService.getAllRecipes();
    // Sort by creation date, newest first
    storedRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecipes(storedRecipes);
    setFilteredRecipes(storedRecipes); // Initialize filteredRecipes with all recipes
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(lowerSearchTerm) ||
      (recipe.creatorUsername && recipe.creatorUsername.toLowerCase().includes(lowerSearchTerm)) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerSearchTerm)) ||
      (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
    );
    setFilteredRecipes(results);
  }, [searchTerm, recipes]);

  const handleDeleteRequest = (id: string) => {
    setRecipeToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      recipeLocalStorageService.deleteRecipe(recipeToDelete);
      fetchRecipes(); // Re-fetch to update list
    }
    setIsModalOpen(false);
    setRecipeToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-sky-400">Your Recipes</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
                type="text"
                placeholder="Search recipes, tags..."
                className="w-full sm:w-64 p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-400 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18}/>
          </div>
          <Link
            to="/add"
            className="flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            <PlusCircle size={20} className="mr-2" /> Add New
          </Link>
        </div>
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDeleteRequest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-800 rounded-xl shadow-lg">
          <Frown size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-xl text-slate-400">
            {recipes.length === 0 ? "No recipes found. Add your first one!" : "No recipes match your search."}
          </p>
          {recipes.length === 0 && (
            <Link
            to="/add"
            className="mt-4 inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <PlusCircle size={20} className="mr-2" /> Add Recipe
          </Link>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
        primaryAction={confirmDelete}
        primaryActionText="Delete"
        secondaryAction={() => setIsModalOpen(false)}
        secondaryActionText="Cancel"
      >
        <p>Are you sure you want to delete this recipe? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default HomePage;