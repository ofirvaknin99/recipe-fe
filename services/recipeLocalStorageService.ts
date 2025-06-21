
import { Recipe } from '../types';
import { LOCAL_STORAGE_RECIPES_KEY } from '../constants';

const getAllRecipes = (): Recipe[] => {
  const recipesJson = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
  return recipesJson ? JSON.parse(recipesJson) : [];
};

const getRecipeById = (id: string): Recipe | undefined => {
  const recipes = getAllRecipes();
  return recipes.find(recipe => recipe.id === id);
};

const addRecipe = (recipe: Recipe): void => {
  const recipes = getAllRecipes();
  recipes.push(recipe);
  localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(recipes));
};

const updateRecipe = (id: string, updatedRecipe: Recipe): void => {
  let recipes = getAllRecipes();
  recipes = recipes.map(recipe => (recipe.id === id ? { ...updatedRecipe, id } : recipe));
  localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(recipes));
};

const deleteRecipe = (id: string): void => {
  let recipes = getAllRecipes();
  recipes = recipes.filter(recipe => recipe.id !== id);
  localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(recipes));
};

export const recipeLocalStorageService = {
  getAllRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
};
