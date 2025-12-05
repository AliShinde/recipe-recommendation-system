/**
 * Type definitions for the recipe recommendation system
 */

export interface Ingredient {
	id: string;
	name: string;
}

export interface Recipe {
	id: number;
	name: string;
	ingredients: string[];
	description: string;
	cookingTime: number;
	difficulty: "easy" | "medium" | "hard";
	cuisine: string;
	match_score?: number;
	ingredient_match_percentage?: number;
}

export interface RecommendationRequest {
	ingredients: string[];
	top_k?: number;
	min_score?: number;
}

export interface RecommendationResponse {
	success: boolean;
	count: number;
	recommendations: Recipe[];
	query: string[];
	error?: string;
}
