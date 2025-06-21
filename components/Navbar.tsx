
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white hover:text-sky-400 transition-colors">
            Reel Recipes
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Home size={18} className="mr-1" />
              Home
            </Link>
            <Link
              to="/add"
              className="flex items-center text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <PlusCircle size={18} className="mr-1" />
              Add Recipe
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
