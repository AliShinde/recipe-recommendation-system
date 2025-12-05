import React, { useState } from 'react';

const IngredientInput: React.FC<{ onAddIngredient: (ingredient: string) => void }> = ({ onAddIngredient }) => {
    const [ingredient, setIngredient] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIngredient(event.target.value);
    };

    const handleAddIngredient = () => {
        if (ingredient.trim()) {
            onAddIngredient(ingredient.trim());
            setIngredient('');
        }
    };

    return (
        <div>
            <input
                type="text"
                value={ingredient}
                onChange={handleInputChange}
                placeholder="Enter an ingredient"
            />
            <button onClick={handleAddIngredient}>Add Ingredient</button>
        </div>
    );
};

export default IngredientInput;