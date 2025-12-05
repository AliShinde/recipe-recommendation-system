/**
 * Recipe Card Component
 * Displays individual recipe information with match score
 * Uses functional component with proper prop typing
 */

import React from "react";
import { Recipe } from "../types";
import "./RecipeCard.css";

interface RecipeCardProps {
	recipe: Recipe;
	rank?: number;
	onClick?: () => void;
}

/**
 * Component for displaying a single recipe
 * Shows recipe details, match score, and ingredient match percentage
 */
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, rank, onClick }) => {
	/**
	 * Get difficulty color based on difficulty level
	 * Easy = green, Medium = orange, Hard = red
	 */
	const getDifficultyColor = (difficulty: string): string => {
		switch (difficulty) {
			case "easy":
				return "#4caf50";
			case "medium":
				return "#ff9800";
			case "hard":
				return "#f44336";
			default:
				return "#757575";
		}
	};

	/**
	 * Format match score as percentage
	 * Handles null/undefined values gracefully
	 */
	const formatMatchScore = (score?: number): string => {
		if (score === undefined || score === null) {
			return "N/A";
		}
		return `${(score * 100).toFixed(1)}%`;
	};

	/**
	 * Get match score color based on score value
	 * High scores are green, low scores are red
	 */
	const getMatchScoreColor = (score?: number): string => {
		if (score === undefined || score === null) {
			return "#757575";
		}

		if (score >= 0.7) return "#4caf50";
		if (score >= 0.4) return "#ff9800";
		return "#f44336";
	};

	return (
		<div
			className="recipe-card"
			onClick={onClick}
			style={{ cursor: onClick ? "pointer" : "default" }}>
			{/* Rank badge */}
			{rank !== undefined && <div className="rank-badge">#{rank}</div>}

			{/* Recipe header */}
			<div className="recipe-header">
				<h3 className="recipe-name">{recipe.name}</h3>
				<span
					className="recipe-cuisine"
					title="Cuisine type">
					{recipe.cuisine}
				</span>
			</div>

			{/* Match scores */}
			<div className="match-scores">
				<div className="score-item">
					<span className="score-label">Semantic Match:</span>
					<span
						className="score-value"
						style={{
							color: getMatchScoreColor(recipe.match_score),
						}}>
						{formatMatchScore(recipe.match_score)}
					</span>
				</div>

				{recipe.ingredient_match_percentage !== undefined && (
					<div className="score-item">
						<span className="score-label">
							Ingredient Coverage:
						</span>
						<span
							className="score-value"
							style={{
								color: getMatchScoreColor(
									(recipe.ingredient_match_percentage || 0) /
										100
								),
							}}>
							{recipe.ingredient_match_percentage.toFixed(1)}%
						</span>
					</div>
				)}
			</div>

			{/* Recipe description */}
			<p className="recipe-description">{recipe.description}</p>

			{/* Recipe details */}
			<div className="recipe-details">
				<div className="detail-item">
					<span className="detail-icon">⏱️</span>
					<span className="detail-text">
						{recipe.cookingTime} min
					</span>
				</div>

				<div className="detail-item">
					<span
						className="difficulty-badge"
						style={{
							backgroundColor: getDifficultyColor(
								recipe.difficulty
							),
						}}>
						{recipe.difficulty}
					</span>
				</div>
			</div>

			{/* Ingredients list */}
			<div className="recipe-ingredients">
				<h4>Ingredients needed:</h4>
				<ul className="ingredients-list">
					{recipe.ingredients.map((ingredient, index) => (
						<li
							key={index}
							className="ingredient-item">
							{ingredient}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default RecipeCard;
