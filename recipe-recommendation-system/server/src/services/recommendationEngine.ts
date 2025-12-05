export interface Recipe {
    id: number;
    title: string;
    ingredients: string[];
    instructions: string;
}

const recipes: Recipe[] = [
    {
        id: 1,
        title: "Spaghetti Carbonara",
        ingredients: ["spaghetti", "eggs", "parmesan cheese", "black pepper", "guanciale"],
        instructions: "Cook spaghetti. In a bowl, mix eggs and cheese. Fry guanciale. Combine all with pepper."
    },
    {
        id: 2,
        title: "Caprese Salad",
        ingredients: ["mozzarella", "tomatoes", "basil", "olive oil", "balsamic vinegar"],
        instructions: "Layer mozzarella and tomatoes, sprinkle with basil, drizzle with oil and vinegar."
    },
    {
        id: 3,
        title: "Pancakes",
        ingredients: ["flour", "milk", "eggs", "baking powder", "sugar"],
        instructions: "Mix ingredients, pour batter on skillet, flip when bubbles form."
    }
];

export function getRecommendations(availableIngredients: string[]): Recipe[] {
    return recipes.filter(recipe => 
        recipe.ingredients.every(ingredient => availableIngredients.includes(ingredient))
    );
}