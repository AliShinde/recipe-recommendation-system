import React from "react";
import { Recipe } from "../types";
import "./RecipeModal.css";

interface RecipeModalProps {
	recipe: Recipe;
	onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
	// Close modal when clicking outside
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	// Close modal on Escape key
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	// Prevent body scroll when modal is open
	React.useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	const getMatchScoreColor = (score?: number): string => {
		if (!score) return "#6c757d";
		if (score >= 0.7) return "#28a745";
		if (score >= 0.5) return "#ffc107";
		return "#dc3545";
	};

	return (
		<div
			className="modal-backdrop"
			onClick={handleBackdropClick}>
			<div className="modal-content">
				<button
					className="modal-close"
					onClick={onClose}
					aria-label="Close">
					×
				</button>

				<div className="modal-header">
					<h2>{recipe.name}</h2>
					<div className="recipe-meta">
						<span className="badge cuisine-badge">
							{recipe.cuisine}
						</span>
						<span
							className={`badge difficulty-${recipe.difficulty}`}>
							{recipe.difficulty}
						</span>
						<span className="badge time-badge">
							⏱️ {recipe.cookingTime} min
						</span>
					</div>
				</div>

				<div className="modal-body">
					{/* Match Score Section */}
					{recipe.match_score !== undefined && (
						<div className="score-section">
							<div className="score-item">
								<span className="score-label">
									Match Score:
								</span>
								<span
									className="score-value"
									style={{
										color: getMatchScoreColor(
											recipe.match_score
										),
									}}>
									{(recipe.match_score * 100).toFixed(0)}%
								</span>
							</div>
							{recipe.ingredient_match_percentage !==
								undefined && (
								<div className="score-item">
									<span className="score-label">
										Ingredient Coverage:
									</span>
									<span className="score-value">
										{recipe.ingredient_match_percentage.toFixed(
											0
										)}
										%
									</span>
								</div>
							)}
						</div>
					)}

					{/* Description */}
					{recipe.description && (
						<div className="description-section">
							<p>{recipe.description}</p>
						</div>
					)}

					{/* Ingredients Section */}
					<div className="ingredients-section">
						<h3>🥘 Ingredients</h3>
						<ul className="ingredients-list">
							{recipe.ingredients.map((ingredient, index) => (
								<li key={index}>{ingredient}</li>
							))}
						</ul>
					</div>

					{/* Directions Section */}
					{recipe.directions && recipe.directions.length > 0 && (
						<div className="directions-section">
							<h3>👨‍🍳 Cooking Directions</h3>
							<ol className="directions-list">
								{recipe.directions.map((step, index) => (
									<li key={index}>{step}</li>
								))}
							</ol>
						</div>
					)}

					{/* Source */}
					{recipe.source && (
						<div className="source-section">
							<small>Source: {recipe.source}</small>
						</div>
					)}
				</div>

				<div className="modal-footer">
					<button
						className="btn-close-modal"
						onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default RecipeModal;
