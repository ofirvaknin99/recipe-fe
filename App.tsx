
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';

const App: React.FC = () => {
  // IMPORTANT: The Gemini API key is expected to be available as import.meta.env.VITE_GEMINI_API_KEY.
  // This is set via .env file for local dev or environment variables in your hosting provider (e.g., Vercel).
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn(
      "Gemini API key (VITE_GEMINI_API_KEY) is not set. AI features will not work. Ensure it's in your .env file (e.g., VITE_GEMINI_API_KEY=yourkey) or set in your hosting provider's environment variables."
    );
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddRecipePage />} />
        <Route path="/edit/:id" element={<EditRecipePage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
