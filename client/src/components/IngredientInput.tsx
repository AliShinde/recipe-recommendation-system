/**
 * Ingredient Input Component
 * Allows users to add and remove ingredients with proper validation
 * Uses functional programming and ES6 syntax
 */

import React, {
	useState,
	useCallback,
	KeyboardEvent,
	ChangeEvent,
} from "react";
import "./IngredientInput.css";

interface IngredientInputProps {
	onIngredientsChange: (ingredients: string[]) => void;
	onSearch: () => void;
	isLoading?: boolean;
}

/**
 * Component for managing ingredient input
 * Supports adding via button click or Enter key
 * Handles edge cases: empty strings, duplicates, null values
 */
const IngredientInput: React.FC<IngredientInputProps> = ({
	onIngredientsChange,
	onSearch,
	isLoading = false,
}) => {
	// State for current input value
	const [currentInput, setCurrentInput] = useState<string>("");

	// State for list of added ingredients
	const [ingredients, setIngredients] = useState<string[]>([]);

	// State for error message
	const [error, setError] = useState<string>("");

	/**
	 * Add ingredient to the list
	 * Validates input and handles duplicates
	 */
	const addIngredient = useCallback(() => {
		// Clear previous error
		setError("");

		// Trim and validate input
		const trimmedInput = currentInput.trim();

		// Handle empty input
		if (!trimmedInput) {
			setError("Please enter an ingredient");
			return;
		}

		// Check for minimum length
		if (trimmedInput.length < 2) {
			setError("Ingredient must be at least 2 characters");
			return;
		}

		// Check for duplicates (case-insensitive)
		const isDuplicate = ingredients.some(
			(ing) => ing.toLowerCase() === trimmedInput.toLowerCase()
		);

		if (isDuplicate) {
			setError("This ingredient is already in the list");
			return;
		}

		// Add ingredient to list
		const newIngredients = [...ingredients, trimmedInput];
		setIngredients(newIngredients);

		// Notify parent component
		onIngredientsChange(newIngredients);

		// Clear input
		setCurrentInput("");
	}, [currentInput, ingredients, onIngredientsChange]);

	/**
	 * Remove ingredient from the list
	 *
	 * @param index - Index of ingredient to remove
	 */
	const removeIngredient = useCallback(
		(index: number) => {
			// Validate index
			if (index < 0 || index >= ingredients.length) {
				return;
			}

			// Remove ingredient at index
			const newIngredients = ingredients.filter((_, i) => i !== index);
			setIngredients(newIngredients);

			// Notify parent component
			onIngredientsChange(newIngredients);

			// Clear error
			setError("");
		},
		[ingredients, onIngredientsChange]
	);

	/**
	 * Handle input change
	 * Clears error when user starts typing
	 */
	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setCurrentInput(e.target.value);

			// Clear error when user starts typing
			if (error) {
				setError("");
			}
		},
		[error]
	);

	/**
	 * Handle Enter key press
	 * Adds ingredient when Enter is pressed
	 */
	const handleKeyPress = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				addIngredient();
			}
		},
		[addIngredient]
	);

	/**
	 * Handle search button click
	 * Validates that at least one ingredient is present
	 */
	const handleSearch = useCallback(() => {
		if (ingredients.length === 0) {
			setError("Please add at least one ingredient before searching");
			return;
		}

		onSearch();
	}, [ingredients.length, onSearch]);

	/**
	 * Clear all ingredients
	 */
	const clearAll = useCallback(() => {
		setIngredients([]);
		setCurrentInput("");
		setError("");
		onIngredientsChange([]);
	}, [onIngredientsChange]);

	return (
		<div className="ingredient-input-container">
			<h2>What ingredients do you have?</h2>

			{/* Input field and add button */}
			<div className="input-group">
				<input
					type="text"
					value={currentInput}
					onChange={handleInputChange}
					onKeyPress={handleKeyPress}
					placeholder="Enter an ingredient (e.g., chicken, tomatoes)"
					className="ingredient-input"
					disabled={isLoading}
					aria-label="Ingredient input"
				/>
				<button
					onClick={addIngredient}
					className="btn btn-add"
					disabled={isLoading || !currentInput.trim()}
					aria-label="Add ingredient">
					Add
				</button>
			</div>

			{/* Error message display */}
			{error && (
				<div
					className="error-message"
					role="alert">
					{error}
				</div>
			)}

			{/* List of added ingredients */}
			{ingredients.length > 0 && (
				<div className="ingredients-list">
					<div className="list-header">
						<h3>Your Ingredients ({ingredients.length})</h3>
						<button
							onClick={clearAll}
							className="btn btn-clear-all"
							disabled={isLoading}
							aria-label="Clear all ingredients">
							Clear All
						</button>
					</div>

					<ul className="ingredient-tags">
						{ingredients.map((ingredient, index) => (
							<li
								key={index}
								className="ingredient-tag">
								<span className="ingredient-name">
									{ingredient}
								</span>
								<button
									onClick={() => removeIngredient(index)}
									className="btn-remove"
									disabled={isLoading}
									aria-label={`Remove ${ingredient}`}
									title={`Remove ${ingredient}`}>
									×
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Search button */}
			<button
				onClick={handleSearch}
				className="btn btn-search"
				disabled={isLoading || ingredients.length === 0}
				aria-label="Find recipes">
				{isLoading ? "Searching..." : "Find Recipes"}
			</button>
		</div>
	);
};

export default IngredientInput;
