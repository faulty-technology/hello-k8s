import express, { type Request, type Response } from "express";

const app = express();
const port = process.env.PORT ?? 3000;

// Health check endpoint (important for k8s probes)
app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main endpoint
app.get("/", (_req: Request, res: Response) => {
	res.json({
		message: "Hello from Kubernetes, preview test four!",
		environment: process.env.NODE_ENV ?? "development",
		hostname: process.env.HOSTNAME ?? "unknown",
		version: process.env.APP_VERSION ?? "0.0.0",
	});
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
