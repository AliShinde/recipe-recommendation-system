/**
 * Recipe Recommendation Engine Service
 * This service interfaces with the Python ML model via child process
 * Handles input validation, error handling, and response formatting
 */

import { spawn } from "child_process";
import { Recipe, RecommendationResponse } from "../types";
import * as path from "path";

export class RecommendationEngine {
	private pythonScriptPath: string;
	private pythonExecutable: string;

	constructor() {
		// Path to the Python prediction script
		this.pythonScriptPath = path.join(
			__dirname,
			"..",
			"..",
			"..",
			"ml-model",
			"src",
			"predict.py"
		);

		// Use 'python' or 'python3' depending on system
		// In production, this should be configurable via environment variable
		this.pythonExecutable = process.env.PYTHON_PATH || "python";
	}

	/**
	 * Get recipe recommendations based on available ingredients
	 *
	 * @param ingredients - Array of ingredient strings
	 * @param topK - Number of top recommendations to return (default: 5)
	 * @param minScore - Minimum match score threshold 0-1 (default: 0.0)
	 * @returns Promise with recommendation response
	 * @throws Error if validation fails or Python process encounters error
	 */
	async getRecommendations(
		ingredients: string[],
		topK: number = 5,
		minScore: number = 0.0
	): Promise<RecommendationResponse> {
		// Input validation
		this.validateInputs(ingredients, topK, minScore);

		try {
			// Clean and normalize ingredients
			const cleanedIngredients = this.normalizeIngredients(ingredients);

			// Call Python script with ingredients
			const result = await this.callPythonModel(
				cleanedIngredients,
				topK,
				minScore
			);

			return result;
		} catch (error) {
			// Error handling with detailed logging
			console.error("Error in recommendation engine:", error);

			return {
				success: false,
				count: 0,
				recommendations: [],
				query: ingredients,
				error:
					error instanceof Error
						? error.message
						: "Unknown error occurred",
			};
		}
	}

	/**
	 * Validate input parameters
	 *
	 * @param ingredients - Array of ingredient strings
	 * @param topK - Number of recommendations
	 * @param minScore - Minimum score threshold
	 * @throws Error if validation fails
	 */
	private validateInputs(
		ingredients: string[],
		topK: number,
		minScore: number
	): void {
		// Check if ingredients array is provided and not empty
		if (!ingredients || !Array.isArray(ingredients)) {
			throw new Error("Ingredients must be a non-empty array");
		}

		if (ingredients.length === 0) {
			throw new Error("At least one ingredient must be provided");
		}

		// Check for null/undefined/empty string ingredients
		const hasInvalidIngredient = ingredients.some(
			(ing) => !ing || typeof ing !== "string" || ing.trim().length === 0
		);

		if (hasInvalidIngredient) {
			throw new Error("All ingredients must be non-empty strings");
		}

		// Validate topK parameter
		if (!Number.isInteger(topK) || topK <= 0) {
			throw new Error("topK must be a positive integer");
		}

		if (topK > 100) {
			throw new Error("topK cannot exceed 100");
		}

		// Validate minScore parameter
		if (typeof minScore !== "number" || minScore < 0 || minScore > 1) {
			throw new Error("minScore must be a number between 0 and 1");
		}
	}

	/**
	 * Normalize ingredient strings (trim, lowercase, remove duplicates)
	 *
	 * @param ingredients - Raw ingredient array
	 * @returns Cleaned ingredient array
	 */
	private normalizeIngredients(ingredients: string[]): string[] {
		// Trim whitespace and convert to lowercase
		const normalized = ingredients
			.map((ing) => ing.trim().toLowerCase())
			.filter((ing) => ing.length > 0);

		// Remove duplicates using Set
		return Array.from(new Set(normalized));
	}

	/**
	 * Call Python ML model via child process
	 *
	 * @param ingredients - Cleaned ingredient array
	 * @param topK - Number of recommendations
	 * @param minScore - Minimum score threshold
	 * @returns Promise with model predictions
	 */
	private callPythonModel(
		ingredients: string[],
		topK: number,
		minScore: number
	): Promise<RecommendationResponse> {
		return new Promise((resolve, reject) => {
			// Prepare Python script arguments
			const ingredientsJson = JSON.stringify(ingredients);

			// Spawn Python process
			// Pass data via stdin to avoid command line length limitations
			const pythonProcess = spawn(this.pythonExecutable, [
				"-c",
				`
import sys
import json
sys.path.insert(0, '${path
					.dirname(this.pythonScriptPath)
					.replace(/\\/g, "\\\\")}')
from predict import predict_recipes

# Read input from stdin
ingredients_json = sys.stdin.read()
ingredients = json.loads(ingredients_json)

# Get recommendations with silent=True to suppress output
result = predict_recipes(ingredients, top_k=${topK}, min_score=${minScore}, silent=True)

# Output as JSON
print(json.dumps(result))
        `,
			]);

			let stdoutData = "";
			let stderrData = "";

			// Collect stdout data
			pythonProcess.stdout.on("data", (data) => {
				stdoutData += data.toString();
			});

			// Collect stderr data for error logging
			pythonProcess.stderr.on("data", (data) => {
				stderrData += data.toString();
			});

			// Handle process completion
			pythonProcess.on("close", (code) => {
				if (code !== 0) {
					// Process failed
					console.error("Python process stderr:", stderrData);
					reject(
						new Error(
							`Python process exited with code ${code}: ${stderrData}`
						)
					);
					return;
				}

				try {
					// Parse JSON response from Python
					const result: RecommendationResponse =
						JSON.parse(stdoutData);
					resolve(result);
				} catch (error) {
					// JSON parsing failed
					console.error("Failed to parse Python output:", stdoutData);
					reject(new Error("Failed to parse recommendation results"));
				}
			});

			// Handle process errors (e.g., Python not found)
			pythonProcess.on("error", (error) => {
				reject(
					new Error(
						`Failed to start Python process: ${error.message}`
					)
				);
			});

			// Write ingredients to stdin
			pythonProcess.stdin.write(ingredientsJson);
			pythonProcess.stdin.end();

			// Set timeout to prevent hanging processes
			// Increased to 120 seconds for first request (ML model + embeddings loading)
			const timeout = setTimeout(() => {
				pythonProcess.kill();
				reject(new Error("Python process timeout after 120 seconds"));
			}, 120000);

			// Clear timeout on process completion
			pythonProcess.on("close", () => clearTimeout(timeout));
		});
	}

	/**
	 * Get recipe recommendations with retry logic for handling temporary failures
	 *
	 * @param ingredients - Array of ingredient strings
	 * @param topK - Number of recommendations
	 * @param minScore - Minimum score threshold
	 * @param maxRetries - Maximum number of retry attempts (default: 2)
	 * @returns Promise with recommendation response
	 */
	async getRecommendationsWithRetry(
		ingredients: string[],
		topK: number = 5,
		minScore: number = 0.0,
		maxRetries: number = 2
	): Promise<RecommendationResponse> {
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await this.getRecommendations(
					ingredients,
					topK,
					minScore
				);
			} catch (error) {
				lastError =
					error instanceof Error ? error : new Error("Unknown error");
				console.warn(
					`Recommendation attempt ${attempt + 1} failed:`,
					lastError.message
				);

				// Wait before retrying (exponential backoff)
				if (attempt < maxRetries) {
					await this.sleep(Math.pow(2, attempt) * 1000);
				}
			}
		}

		// All retries exhausted
		return {
			success: false,
			count: 0,
			recommendations: [],
			query: ingredients,
			error: `Failed after ${maxRetries + 1} attempts: ${
				lastError?.message
			}`,
		};
	}

	/**
	 * Utility function for async sleep
	 *
	 * @param ms - Milliseconds to sleep
	 * @returns Promise that resolves after specified time
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export singleton instance for use across the application
export const recommendationEngine = new RecommendationEngine();
