/**
 * Lightweight Recipe Matcher (No ML Dependencies)
 * Uses keyword matching and scoring for recipe recommendations
 * Optimized for low-memory environments like Render free tier
 */

import { Recipe, RecommendationResponse } from "../types";
import * as path from "path";
import * as fs from "fs";

export class LightweightRecommendationEngine {
	private recipes: Recipe[];

	constructor() {
		// Load recipes from JSON file
		const recipesPath = path.join(
			__dirname,
			"..",
			"..",
			"..",
			"ml-model",
			"data",
			"recipes.json"
		);
		const data = fs.readFileSync(recipesPath, "utf-8");
		this.recipes = JSON.parse(data);
	}

	/**
	 * Get recipe recommendations based on keyword matching
	 */
	async getRecommendations(
		ingredients: string[],
		topK: number = 5,
		minScore: number = 0.0
	): Promise<RecommendationResponse> {
		// Normalize user ingredients
		const normalizedIngredients = ingredients.map((ing) =>
			ing.toLowerCase().trim()
		);

		// Score each recipe
		const scoredRecipes = this.recipes.map((recipe) => {
			const score = this.calculateMatchScore(
				normalizedIngredients,
				recipe
			);
			return { ...recipe, match_score: score };
		});

		// Filter by minimum score and sort
		const filteredRecipes = scoredRecipes
			.filter((r) => r.match_score >= minScore)
			.sort((a, b) => b.match_score - a.match_score)
			.slice(0, topK);

		// Calculate ingredient coverage for each recipe
		const recommendations = filteredRecipes.map((recipe) => {
			const coverage = this.calculateIngredientCoverage(
				normalizedIngredients,
				recipe
			);
			return {
				...recipe,
				ingredient_match_percentage: coverage * 100,
			};
		});

		return {
			success: true,
			count: recommendations.length,
			recommendations: recommendations,
			query_ingredients: ingredients,
		};
	}

	/**
	 * Calculate match score using keyword overlap and semantic similarity
	 */
	private calculateMatchScore(
		userIngredients: string[],
		recipe: Recipe
	): number {
		const recipeIngredients = recipe.ingredients.map((ing) =>
			ing.toLowerCase()
		);

		let matchCount = 0;
		let partialMatchCount = 0;

		// Check for exact and partial matches
		userIngredients.forEach((userIng) => {
			recipeIngredients.forEach((recipeIng) => {
				// Exact match
				if (recipeIng === userIng || recipeIng.includes(userIng)) {
					matchCount++;
				}
				// Partial match (e.g., "chicken" matches "chicken breast")
				else if (
					this.isPartialMatch(userIng, recipeIng) ||
					this.isPartialMatch(recipeIng, userIng)
				) {
					partialMatchCount++;
				}
			});
		});

		// Calculate weighted score
		const exactMatchWeight = 1.0;
		const partialMatchWeight = 0.5;
		const totalScore =
			matchCount * exactMatchWeight +
			partialMatchCount * partialMatchWeight;

		// Normalize by recipe ingredient count (recipes with fewer ingredients score higher)
		const normalizedScore =
			totalScore / Math.sqrt(recipeIngredients.length);

		// Scale to 0-1 range (cap at 1.0)
		return Math.min(normalizedScore / 2, 1.0);
	}

	/**
	 * Calculate what percentage of recipe ingredients the user has
	 */
	private calculateIngredientCoverage(
		userIngredients: string[],
		recipe: Recipe
	): number {
		const recipeIngredients = recipe.ingredients.map((ing) =>
			ing.toLowerCase()
		);
		let coveredCount = 0;

		recipeIngredients.forEach((recipeIng) => {
			const isCovered = userIngredients.some(
				(userIng) =>
					recipeIng.includes(userIng) ||
					userIng.includes(recipeIng) ||
					this.isPartialMatch(userIng, recipeIng)
			);
			if (isCovered) coveredCount++;
		});

		return coveredCount / recipeIngredients.length;
	}

	/**
	 * Check if two ingredients are partial matches
	 */
	private isPartialMatch(ing1: string, ing2: string): boolean {
		// Common ingredient variations
		const words1 = ing1.split(/\s+/);
		const words2 = ing2.split(/\s+/);

		return words1.some((w1) =>
			words2.some(
				(w2) =>
					w1.length > 3 &&
					w2.length > 3 &&
					(w1.includes(w2) || w2.includes(w1))
			)
		);
	}

	/**
	 * Validate inputs
	 */
	private validateInputs(
		ingredients: string[],
		topK: number,
		minScore: number
	): void {
		if (!ingredients || ingredients.length === 0) {
			throw new Error("At least one ingredient is required");
		}

		if (topK < 1 || topK > 50) {
			throw new Error("topK must be between 1 and 50");
		}

		if (minScore < 0 || minScore > 1) {
			throw new Error("minScore must be between 0 and 1");
		}
	}
}
