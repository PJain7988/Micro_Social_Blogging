import authRoutes from "./modules/auth/auth.routes";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB, disconnectDB } from "./config/db";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5173"
).split(",").map((origin) => origin.trim());

app.use(helmet());


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Chirpwell backend is running!",
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Chirpwell server running on port ${PORT}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

void startServer();
