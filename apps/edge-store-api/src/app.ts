import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config/index";
import { publicRouters } from "./routes/public";
import { privateRouters } from "./routes/private";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
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

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: "Too many requests, please try again later." },
  });
  
  app.use(`/api/${config.apiVersion}/`, limiter);

  // Mount Public Routes (no auth required)
  app.use(`/api/${config.apiVersion}`, publicRouters);

  // Mount Private Routes (auth required)
  // Note: In the future, add authMiddleware here: 
  // app.use(`/api/${config.apiVersion}`, authMiddleware, privateRouters);
  app.use(`/api/${config.apiVersion}`, privateRouters);

  app.use(errorHandler);

  return app;
};