import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';
import { Eye, Edit3, Trash2, ExternalLink, User, Calendar, Tag } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onDelete }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <img 
        src={recipe.thumbnailUrl || 'https://picsum.photos/400/200?blur=2'} 
        alt={recipe.title} 
        className="w-full h-48 object-cover" 
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/200?grayscale'; }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-sky-400 mb-2 truncate" title={recipe.title}>{recipe.title}</h3>
        
        {recipe.creatorUsername && (
          <p className="text-sm text-slate-400 mb-1 flex items-center">
            <User size={14} className="mr-2 text-sky-500" /> {recipe.creatorUsername}
          </p>
        )}
        <p className="text-xs text-slate-500 mb-3 flex items-center">
          <Calendar size={14} className="mr-2 text-sky-500" /> Added: {new Date(recipe.createdAt).toLocaleDateString()}
        </p>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 items-center">
            <Tag size={14} className="text-indigo-400 mr-1" />
            {recipe.tags.slice(0, 3).map(tag => (
              <span key={tag} className="bg-indigo-500 text-indigo-100 text-xs font-medium px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-indigo-400 text-xs font-medium px-2 py-0.5 rounded-full">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="mt-auto"> {/* Pushes buttons to the bottom */}
            <div className="flex flex-wrap gap-2 mt-4">
                <Link
                    to={`/recipe/${recipe.id}`}
                    className="flex-1 text-center bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                    <Eye size={16} className="mr-1" /> View
                </Link>
                <Link
                    to={`/edit/${recipe.id}`}
                    className="flex-1 text-center bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                    <Edit3 size={16} className="mr-1" /> Edit
                </Link>
                <button
                    onClick={() => onDelete(recipe.id)}
                    className="flex-1 text-center bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                    <Trash2 size={16} className="mr-1" /> Delete
                </button>
            </div>
            {recipe.originalLink && (
                <a 
                    href={recipe.originalLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-3 text-xs text-sky-400 hover:text-sky-300 flex items-center justify-center transition-colors"
                >
                    <ExternalLink size={12} className="mr-1" /> Original Post
                </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;