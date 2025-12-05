export interface Recipe {
    id: string;
    title: string;
    ingredients: Ingredient[];
    instructions: string;
}

export interface Ingredient {
    name: string;
    quantity: string;
}

export interface RecommendationRequest {
    ingredients: string[];
}

export interface RecommendationResponse {
    recipes: Recipe[];
}