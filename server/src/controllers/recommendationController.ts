/**
 * Recommendation Controller
 * Handles HTTP requests for recipe recommendations
 * Implements proper error handling and input validation
 */

import { Request, Response } from "express";
import { recommendationEngine } from "../services/recommendationEngine";
import { RecommendationRequest } from "../types";

/**
 * POST /api/recommendations
 * Get recipe recommendations based on available ingredients
 *
 * Request body:
 * {
 *   ingredients: string[],
 *   top_k?: number,
 *   min_score?: number
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   recommendations: Recipe[],
 *   query: string[],
 *   error?: string
 * }
 */
export const getRecommendations = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Extract request body
		const { ingredients, top_k, min_score }: RecommendationRequest =
			req.body;

		// Validate request body exists
		if (!req.body || Object.keys(req.body).length === 0) {
			res.status(400).json({
				success: false,
				error: "Request body is required",
				count: 0,
				recommendations: [],
				query: [],
			});
			return;
		}

		// Validate ingredients parameter
		if (!ingredients) {
			res.status(400).json({
				success: false,
				error: "ingredients field is required",
				count: 0,
				recommendations: [],
				query: [],
			});
			return;
		}

		if (!Array.isArray(ingredients)) {
			res.status(400).json({
				success: false,
				error: "ingredients must be an array",
				count: 0,
				recommendations: [],
				query: [],
			});
			return;
		}

		if (ingredients.length === 0) {
			res.status(400).json({
				success: false,
				error: "At least one ingredient is required",
				count: 0,
				recommendations: [],
				query: [],
			});
			return;
		}

		// Set default values for optional parameters
		const topK = top_k || 5;
		const minScore = min_score || 0.0;

		// Validate optional parameters
		if (typeof topK !== "number" || topK <= 0 || !Number.isInteger(topK)) {
			res.status(400).json({
				success: false,
				error: "top_k must be a positive integer",
				count: 0,
				recommendations: [],
				query: ingredients,
			});
			return;
		}

		if (typeof minScore !== "number" || minScore < 0 || minScore > 1) {
			res.status(400).json({
				success: false,
				error: "min_score must be a number between 0 and 1",
				count: 0,
				recommendations: [],
				query: ingredients,
			});
			return;
		}

		// Get recommendations from the ML model
		const result = await recommendationEngine.getRecommendationsWithRetry(
			ingredients,
			topK,
			minScore
		);

		// Return appropriate status code based on result
		if (result.success) {
			// Success - return 200
			res.status(200).json(result);
		} else {
			// Model returned error - return 500 (internal server error)
			res.status(500).json(result);
		}
	} catch (error) {
		// Unexpected error - log and return 500
		console.error("Error in getRecommendations controller:", error);

		res.status(500).json({
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Internal server error",
			count: 0,
			recommendations: [],
			query: req.body?.ingredients || [],
		});
	}
};

/**
 * GET /api/recommendations/health
 * Health check endpoint to verify the recommendation service is running
 *
 * Response:
 * {
 *   status: 'ok' | 'error',
 *   message: string,
 *   timestamp: string
 * }
 */
export const healthCheck = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Test the recommendation engine with a simple query
		const testResult = await recommendationEngine.getRecommendations(
			["chicken"],
			1,
			0.0
		);

		if (testResult.success) {
			res.status(200).json({
				status: "ok",
				message: "Recommendation service is healthy",
				timestamp: new Date().toISOString(),
			});
		} else {
			res.status(503).json({
				status: "error",
				message: "Recommendation service is not responding properly",
				timestamp: new Date().toISOString(),
				error: testResult.error,
			});
		}
	} catch (error) {
		res.status(503).json({
			status: "error",
			message: "Recommendation service health check failed",
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
