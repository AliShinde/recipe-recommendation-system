/**
 * Express Server Application
 * Main entry point for the recipe recommendation API
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import recommendationRoutes from "./routes/recommendations";

// Initialize Express app
const app: Application = express();

// Middleware configuration
// Enable CORS for all routes
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	})
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// API Routes
app.use("/api/recommendations", recommendationRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Recipe Recommendation API",
		version: "1.0.0",
		endpoints: {
			recommendations: "/api/recommendations",
			health: "/api/recommendations/health",
		},
	});
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		error: "Route not found",
		path: req.path,
	});
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error("Unhandled error:", err);

	res.status(500).json({
		success: false,
		error: "Internal server error",
		message:
			process.env.NODE_ENV === "development" ? err.message : undefined,
	});
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
