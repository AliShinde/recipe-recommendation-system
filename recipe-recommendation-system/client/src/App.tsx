import React, { useState } from 'react';
import IngredientInput from './components/IngredientInput';
import RecommendationList from './components/RecommendationList';
import { fetchRecommendations } from './services/api';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleIngredientSubmit = async (newIngredients: string[]) => {
    setIngredients(newIngredients);
    const recommendedRecipes = await fetchRecommendations(newIngredients);
    setRecommendations(recommendedRecipes);
  };

  return (
    <div>
      <h1>Recipe Recommendation System</h1>
      <IngredientInput onSubmit={handleIngredientSubmit} />
      <RecommendationList recommendations={recommendations} />
    </div>
  );
};

export default App;