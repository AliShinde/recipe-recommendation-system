/**
 * Type definitions for the frontend application
 */

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
	directions?: string[];
	source?: string;
}

export interface RecommendationResponse {
	success: boolean;
	count: number;
	recommendations: Recipe[];
	query: string[];
	error?: string;
}
