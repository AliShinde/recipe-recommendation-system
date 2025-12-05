import React from 'react';

interface RecipeCardProps {
    title: string;
    ingredients: string[];
    instructions: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, ingredients, instructions }) => {
    return (
        <div className="recipe-card">
            <h2>{title}</h2>
            <h3>Ingredients:</h3>
            <ul>
                {ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
            <h3>Instructions:</h3>
            <p>{instructions}</p>
        </div>
    );
};

export default RecipeCard;