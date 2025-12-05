import React from 'react';
import { Recipe } from '../types';

interface RecommendationListProps {
  recipes: Recipe[];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recipes }) => {
  return (
    <div>
      <h2>Recommended Recipes</h2>
      {recipes.length === 0 ? (
        <p>No recipes found. Please enter more ingredients.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <h3>{recipe.title}</h3>
              <p>Ingredients: {recipe.ingredients.join(', ')}</p>
              <p>Instructions: {recipe.instructions}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecommendationList;