/**
 * Recommendation Routes
 * Defines API endpoints for recipe recommendations
 */

import { Router } from "express";
import {
	getRecommendations,
	healthCheck,
} from "../controllers/recommendationController";

const router = Router();

/**
 * POST /api/recommendations
 * Get recipe recommendations based on ingredients
 */
router.post("/", getRecommendations);

/**
 * GET /api/recommendations/health
 * Health check for recommendation service
 */
router.get("/health", healthCheck);

export default router;
