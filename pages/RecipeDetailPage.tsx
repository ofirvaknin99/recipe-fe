import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { recipeLocalStorageService } from '../services/recipeLocalStorageService';
import { ChevronLeft, Edit3, Trash2, ExternalLink, User, Calendar, ListChecks, UtensilsCrossed, StickyNote, AlertTriangle, Square, CheckSquare, Tag as TagIcon } from 'lucide-react';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipe: Recipe | undefined = id ? recipeLocalStorageService.getRecipeById(id) : undefined;

  const [checkedIngredientIds, setCheckedIngredientIds] = useState<Set<string>>(new Set());
  const [checkedStepIndices, setCheckedStepIndices] = useState<Set<number>>(new Set());

  if (!recipe) {
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

  const toggleIngredient = (ingredientId: string) => {
    setCheckedIngredientIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const toggleStep = (stepIndex: number) => {
    setCheckedStepIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };
  
  const DetailSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }> = ({ icon, title, children, className }) => (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      {children}
    </div>
  );

  return (
    <div className="bg-slate-800 p-4 sm:p-8 rounded-xl shadow-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sky-400 hover:text-sky-300 mb-6 transition-colors font-medium"
      >
        <ChevronLeft size={20} className="mr-1" /> Back to Recipes
      </button>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">{recipe.title}</h1>
        {recipe.creatorUsername && (
          <p className="text-md text-slate-400 flex items-center mb-1">
            <User size={16} className="mr-2 text-sky-500" /> By: {recipe.creatorUsername}
          </p>
        )}
        <p className="text-sm text-slate-500 flex items-center mb-2">
            <Calendar size={14} className="mr-2 text-sky-500" /> Added: {new Date(recipe.createdAt).toLocaleDateString()}
        </p>
        {recipe.originalLink && (
          <a
            href={recipe.originalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-sky-400 hover:text-sky-300 transition-colors mr-4"
          >
            <ExternalLink size={14} className="mr-1" /> View Original Post
          </a>
        )}
         {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <TagIcon size={16} className="text-indigo-400 mr-1" />
            {recipe.tags.map(tag => (
              <span key={tag} className="bg-indigo-500 text-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <img 
        src={recipe.thumbnailUrl || 'https://picsum.photos/800/400?blur=2'} 
        alt={recipe.title} 
        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 shadow-lg"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/800/400?grayscale'; }}
      />
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <DetailSection icon={<ListChecks size={24} className="text-sky-500" />} title="Ingredients">
                {recipe.ingredients.length > 0 ? (
                <ul className="list-none space-y-2">
                    {recipe.ingredients.map((ing) => {
                      const isChecked = checkedIngredientIds.has(ing.id);
                      return (
                        <li 
                          key={ing.id} 
                          onClick={() => toggleIngredient(ing.id)}
                          className={`flex items-center p-3 bg-slate-700 rounded-md text-slate-300 cursor-pointer hover:bg-slate-600 transition-colors ${isChecked ? 'line-through text-slate-500 opacity-75' : ''}`}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleIngredient(ing.id)}
                        >
                          {isChecked ? <CheckSquare size={20} className="mr-3 text-green-500 shrink-0" /> : <Square size={20} className="mr-3 text-sky-500 shrink-0" />}
                          <div className="flex-grow">
                            <span className={`font-semibold ${isChecked ? 'text-slate-500' : 'text-sky-300'}`}>{ing.quantity}</span>
                            {ing.quantityMetric && ing.quantityMetric.trim() !== "" && (
                                <span className={`text-sm ${isChecked ? 'text-slate-600' : 'text-slate-400'}`}> ({ing.quantityMetric})</span>
                            )}
                            <span className="ml-2">{ing.name}</span>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                ) : (
                <p className="text-slate-400 italic">No ingredients listed.</p>
                )}
            </DetailSection>
        </div>

        <div className="md:col-span-2">
            <DetailSection icon={<UtensilsCrossed size={24} className="text-sky-500" />} title="Preparation Steps">
                {recipe.steps.length > 0 ? (
                <ol className="list-none space-y-3">
                    {recipe.steps.map((step, index) => {
                      const isChecked = checkedStepIndices.has(index);
                      return (
                        <li 
                          key={index} 
                          onClick={() => toggleStep(index)}
                          className={`flex items-start p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors ${isChecked ? 'opacity-75' : ''}`}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleStep(index)}
                        >
                          {isChecked ? <CheckSquare size={20} className="mr-3 mt-0.5 text-green-500 shrink-0" /> : <Square size={20} className="mr-3 mt-0.5 text-sky-500 shrink-0" />}
                          <span className={`mr-3 font-semibold p-0 bg-transparent rounded-full h-auto w-auto flex items-center justify-center shrink-0 ${isChecked ? 'text-slate-500' : 'text-sky-400'}`}>{index + 1}.</span>
                          <p className={`flex-1 ${isChecked ? 'line-through text-slate-500' : 'text-slate-300'}`}>{step}</p>
                        </li>
                      );
                    })}
                </ol>
                ) : (
                <p className="text-slate-400 italic">No steps provided.</p>
                )}
            </DetailSection>
        </div>
      </div>

      {recipe.notes && recipe.notes.trim() && (
        <DetailSection icon={<StickyNote size={24} className="text-sky-500" />} title="Notes & Tips" className="mt-2 md:mt-0">
          <p className="text-slate-300 whitespace-pre-wrap p-3 bg-slate-700 rounded-md">{recipe.notes}</p>
        </DetailSection>
      )}

      <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
        <Link
          to={`/edit/${recipe.id}`}
          className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Edit3 size={18} className="mr-2" /> Edit Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetailPage;