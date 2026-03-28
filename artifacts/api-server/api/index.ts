/**
 * Vercel serverless entry point.
 *
 * Vercel's @vercel/node builder picks this file up, compiles it, and wraps
 * the exported Express app as a serverless function — no app.listen() needed.
 *
 * For local / Replit execution use src/index.ts instead (calls app.listen).
 */
import app from "../src/app";

export default app;
