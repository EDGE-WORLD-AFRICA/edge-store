import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/index";
import { publicRouters } from "./routes/public";
import { privateRouters } from "./routes/private";
import { errorHandler } from "./middleware/errorHandler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // Serve uploaded files statically
  const uploadsDir = path.resolve(__dirname, "../uploads");
  app.use("/uploads", express.static(uploadsDir));

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: "Too many requests, please try again later." },
  });

  // Public routes (NO auth middleware)
  app.use(`/api/${config.apiVersion}`, publicRouters);

  // Private routes (auth middleware applied inside privateRouters)
  app.use(`/api/${config.apiVersion}`, privateRouters);

  app.use(errorHandler);

  return app;
};