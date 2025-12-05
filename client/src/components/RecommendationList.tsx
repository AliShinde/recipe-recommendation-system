/**
 * Recommendation List Component
 * Displays list of recommended recipes or appropriate messages
 * Handles loading, error, and empty states with proper error handling
 */

import React, { useState } from "react";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import { Recipe } from "../types";
import "./RecommendationList.css";

interface RecommendationListProps {
	recipes: Recipe[];
	isLoading: boolean;
	error: string | null;
	hasSearched: boolean;
}

/**
 * Component for displaying recipe recommendations
 * Shows loading spinner, error messages, or recipe cards
 */
const RecommendationList: React.FC<RecommendationListProps> = ({
	recipes,
	isLoading,
	error,
	hasSearched,
}) => {
	const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
	/**
	 * Render loading state
	 * Shows spinner and message while fetching recommendations
	 */
	const renderLoading = () => (
		<div className="recommendation-state loading-state">
			<div
				className="spinner"
				aria-label="Loading"></div>
			<p>Finding the best recipes for you...</p>
		</div>
	);

	/**
	 * Render error state
	 * Shows error message with retry suggestion
	 */
	const renderError = () => (
		<div
			className="recommendation-state error-state"
			role="alert">
			<div className="error-icon">⚠️</div>
			<h3>Oops! Something went wrong</h3>
			<p className="error-message">{error}</p>
			<p className="error-hint">
				Please try again. If the problem persists, check if the backend
				server is running.
			</p>
		</div>
	);

	/**
	 * Render empty state (no results found)
	 * Shows when search returns no recipes
	 */
	const renderEmpty = () => (
		<div className="recommendation-state empty-state">
			<div className="empty-icon">🔍</div>
			<h3>No recipes found</h3>
			<p>
				We couldn't find any recipes matching your ingredients. Try
				adding more common ingredients or removing some specific ones.
			</p>
		</div>
	);

	/**
	 * Render initial state (before first search)
	 * Shows helpful message before user searches
	 */
	const renderInitial = () => (
		<div className="recommendation-state initial-state">
			<div className="initial-icon">👨‍🍳</div>
			<h3>Ready to cook?</h3>
			<p>
				Add your available ingredients above and click "Find Recipes" to
				get personalized recipe recommendations!
			</p>
			<div className="features">
				<div className="feature-item">
					<span className="feature-icon">🤖</span>
					<span>AI-powered matching</span>
				</div>
				<div className="feature-item">
					<span className="feature-icon">⚡</span>
					<span>Instant results</span>
				</div>
				<div className="feature-item">
					<span className="feature-icon">🎯</span>
					<span>Ranked by relevance</span>
				</div>
			</div>
		</div>
	);

	/**
	 * Render recipe list
	 * Shows recipe cards with ranking
	 */
	const renderRecipes = () => {
		// Handle null or undefined recipes array
		if (!recipes || !Array.isArray(recipes)) {
			return renderEmpty();
		}

		return (
			<div className="recommendations-container">
				<div className="recommendations-header">
					<h2>Recommended Recipes</h2>
					<span className="recipe-count">
						Found {recipes.length}{" "}
						{recipes.length === 1 ? "recipe" : "recipes"}
					</span>
				</div>

				<div className="recipes-grid">
					{recipes.map((recipe, index) => (
						<RecipeCard
							key={recipe.id}
							recipe={recipe}
							rank={index + 1}
							onClick={() => setSelectedRecipe(recipe)}
						/>
					))}
				</div>
			</div>
		);
	};

	/**
	 * Main render logic
	 * Determines which state to display based on props
	 */
	// Priority order: loading -> error -> recipes -> empty -> initial
	if (isLoading) {
		return renderLoading();
	}

	if (error) {
		return renderError();
	}

	if (recipes && recipes.length > 0) {
		return (
			<>
				{renderRecipes()}
				{selectedRecipe && (
					<RecipeModal
						recipe={selectedRecipe}
						onClose={() => setSelectedRecipe(null)}
					/>
				)}
			</>
		);
	}

	if (hasSearched) {
		return renderEmpty();
	}

	return renderInitial();
};

export default RecommendationList;
