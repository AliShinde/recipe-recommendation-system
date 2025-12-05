/**
 * Main App Component
 * Integrates all components and handles state management
 * Uses functional programming with hooks
 */

import React, { useState, useCallback } from "react";
import IngredientInput from "./components/IngredientInput";
import RecommendationList from "./components/RecommendationList";
import { getRecommendations, withRetry } from "./services/api";
import { Recipe } from "./types";
import "./App.css";

/**
 * Main application component
 * Manages application state and coordinates child components
 */
const App: React.FC = () => {
	// State for user's ingredients
	const [ingredients, setIngredients] = useState<string[]>([]);

	// State for recipe recommendations
	const [recipes, setRecipes] = useState<Recipe[]>([]);

	// State for loading indicator
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// State for error messages
	const [error, setError] = useState<string | null>(null);

	// State to track if user has searched at least once
	const [hasSearched, setHasSearched] = useState<boolean>(false);

	/**
	 * Handle ingredient list changes
	 * Updates state when user adds/removes ingredients
	 */
	const handleIngredientsChange = useCallback(
		(newIngredients: string[]) => {
			setIngredients(newIngredients);

			// Clear previous errors when ingredients change
			if (error) {
				setError(null);
			}
		},
		[error]
	);

	/**
	 * Handle recipe search
	 * Fetches recommendations from API with error handling
	 */
	const handleSearch = useCallback(async () => {
		// Validate ingredients
		if (!ingredients || ingredients.length === 0) {
			setError("Please add at least one ingredient");
			return;
		}

		// Reset state
		setIsLoading(true);
		setError(null);
		setRecipes([]);
		setHasSearched(true);

		try {
			// Fetch recommendations with retry logic
			const response = await withRetry(
				() => getRecommendations(ingredients, 10, 0.0),
				2, // max retries
				1000 // base delay
			);

			// Handle successful response
			if (response.success && response.recommendations) {
				setRecipes(response.recommendations);

				// Show message if no recipes found
				if (response.recommendations.length === 0) {
					setError(
						"No recipes found with these ingredients. Try adding more common ingredients."
					);
				}
			} else {
				// API returned success: false
				setError(response.error || "Failed to get recommendations");
			}
		} catch (err) {
			// Handle API errors
			console.error("Error fetching recommendations:", err);

			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	}, [ingredients]);

	return (
		<div className="app">
			{/* Header */}
			<header className="app-header">
				<h1>🍳 Recipe Recommendation System</h1>
				<p className="app-subtitle">
					AI-powered recipe recommendations based on your available
					ingredients
				</p>
			</header>

			{/* Main content */}
			<main className="app-main">
				<div className="app-container">
					{/* Ingredient input section */}
					<section className="input-section">
						<IngredientInput
							onIngredientsChange={handleIngredientsChange}
							onSearch={handleSearch}
							isLoading={isLoading}
						/>
					</section>

					{/* Results section */}
					<section className="results-section">
						<RecommendationList
							recipes={recipes}
							isLoading={isLoading}
							error={error}
							hasSearched={hasSearched}
						/>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="app-footer">
				<p>
					Powered by Hugging Face Sentence Transformers
					<span className="tech-badge">
						sentence-transformers/all-MiniLM-L6-v2
					</span>
				</p>
			</footer>
		</div>
	);
};

export default App;
