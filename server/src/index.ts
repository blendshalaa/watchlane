import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./utils/config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import urlRoutes from "./routes/url.routes.js";
import { startCronScheduler } from "./cron.js";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on("uncaughtException", (err) => {
    console.error("[Fatal] Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[Fatal] Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

const app = express();

// 1. Better Auth handler MUST come before express.json() and uses app.all
//    to preserve the full URL path (app.use strips the mount prefix).
app.all("/api/auth/*", (req, res, next) => {
    console.log(`[Auth] ${req.method} ${req.originalUrl}`);
    next();
}, toNodeHandler(auth));

// 2. Body parser for all other routes
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "watchlane",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/urls", urlRoutes);

// Provide API 404 handler
app.use("/api", (req, res) => {
    console.warn(`[404] API Route Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

// Serve frontend in production
if (config.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
}

// Global error handler
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
    console.log(
        `🚀 Watchlane API running on port ${config.PORT} [${config.NODE_ENV}]`
    );

    // Start cron scheduler
    startCronScheduler();
});

export default app;
