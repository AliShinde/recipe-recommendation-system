export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  title: string;
  ingredients: Ingredient[];
  instructions: string;
}

export interface Recommendation {
  recipe: Recipe;
  score: number;
}