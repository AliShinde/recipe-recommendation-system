/**
 * Express Server Application
 * Main entry point for the recipe recommendation API
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import recommendationRoutes from "./routes/recommendations";

// Initialize Express app
const app: Application = express();

// Middleware configuration
// Enable CORS for both local and production environments
const allowedOrigins = [
	"http://localhost:3000", // Local development
	"http://localhost:3001", // Alternative local port
	"https://recipe-recommendation-system-xszh.onrender.com", // Production frontend
	process.env.CLIENT_URL, // Additional production URL from env
].filter(Boolean); // Remove undefined values

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true);

			// Check if origin is in allowed list or matches pattern
			const isAllowed = allowedOrigins.some(allowed => 
				origin === allowed || origin?.includes('onrender.com')
			);

			if (isAllowed) {
				callback(null, true);
			} else {
				console.warn(`CORS blocked origin: ${origin}`);
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
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

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
	res.json({
		message: "Recipe Recommendation API",
		version: "1.0.0",
		status: "healthy",
		endpoints: {
			recommendations: "/api/recommendations",
			health: "/api/health",
		},
	});
});

// Serve static frontend files (React build)
app.use(express.static(path.join(__dirname, "../public")));

// Catch-all route for React Router (SPA)
// This must be AFTER API routes to avoid conflicts
app.get("*", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
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
