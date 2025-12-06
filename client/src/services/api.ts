/**
 * API Service for communicating with the backend
 * Handles all HTTP requests with proper error handling and timeout management
 */

import { RecommendationResponse } from "../types";

// API configuration
const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const REQUEST_TIMEOUT = 120000; // 120 seconds (2 minutes) for ML model cold start

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: any
	) {
		super(message);
		this.name = "ApiError";
	}
}

/**
 * Fetch with timeout wrapper
 * Prevents hanging requests by enforcing a timeout
 *
 * @param url - Request URL
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise with fetch response
 */
const fetchWithTimeout = async (
	url: string,
	options: RequestInit = {},
	timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
	// Create abort controller for timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw new ApiError(
				"Request timeout - server took too long to respond"
			);
		}
		throw error;
	}
};

/**
 * Get recipe recommendations based on ingredients
 *
 * @param ingredients - Array of ingredient strings
 * @param topK - Number of recommendations to return (default: 5)
 * @param minScore - Minimum match score threshold (default: 0.0)
 * @returns Promise with recommendation response
 * @throws ApiError if request fails
 */
export const getRecommendations = async (
	ingredients: string[],
	topK: number = 5,
	minScore: number = 0.0
): Promise<RecommendationResponse> => {
	// Input validation
	if (!ingredients || ingredients.length === 0) {
		throw new ApiError("At least one ingredient is required");
	}

	// Filter out empty strings
	const validIngredients = ingredients
		.map((ing) => ing.trim())
		.filter((ing) => ing.length > 0);

	if (validIngredients.length === 0) {
		throw new ApiError("No valid ingredients provided");
	}

	try {
		// Make POST request to recommendations endpoint
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/recommendations`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					ingredients: validIngredients,
					top_k: topK,
					min_score: minScore,
				}),
			}
		);

		// Parse JSON response
		const data: RecommendationResponse = await response.json();

		// Check if request was successful
		if (!response.ok) {
			throw new ApiError(
				data.error || "Failed to get recommendations",
				response.status,
				data
			);
		}

		// Check if API returned success: false
		if (!data.success) {
			throw new ApiError(
				data.error || "Recommendation service returned an error",
				response.status,
				data
			);
		}

		return data;
	} catch (error) {
		// Handle network errors
		if (error instanceof TypeError && error.message === "Failed to fetch") {
			throw new ApiError(
				"Unable to connect to the server. Please check if the backend is running."
			);
		}

		// Re-throw ApiError
		if (error instanceof ApiError) {
			throw error;
		}

		// Handle unexpected errors
		throw new ApiError(
			error instanceof Error
				? error.message
				: "An unexpected error occurred"
		);
	}
};

/**
 * Check if the API server is healthy
 *
 * @returns Promise with boolean indicating health status
 */
export const checkHealth = async (): Promise<boolean> => {
	try {
		const response = await fetchWithTimeout(
			`${API_BASE_URL}/recommendations/health`,
			{ method: "GET" },
			5000 // Shorter timeout for health check
		);

		if (!response.ok) {
			return false;
		}

		const data = await response.json();
		return data.status === "ok";
	} catch (error) {
		console.error("Health check failed:", error);
		return false;
	}
};

/**
 * Retry a function with exponential backoff
 * Useful for handling temporary network issues
 *
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise with function result
 */
export const withRetry = async <T>(
	fn: () => Promise<T>,
	maxRetries: number = 2,
	baseDelay: number = 1000
): Promise<T> => {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError =
				error instanceof Error ? error : new Error("Unknown error");

			// Don't retry on client errors (4xx)
			if (
				error instanceof ApiError &&
				error.statusCode &&
				error.statusCode < 500
			) {
				throw error;
			}

			// Wait before retrying (exponential backoff)
			if (attempt < maxRetries) {
				await new Promise((resolve) =>
					setTimeout(resolve, baseDelay * Math.pow(2, attempt))
				);
			}
		}
	}

	throw lastError;
};

export { ApiError };
