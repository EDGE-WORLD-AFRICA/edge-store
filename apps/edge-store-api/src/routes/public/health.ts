import { Router } from "express";
import { testDatabaseConnection } from "../../config/dbconnection";
import { sendSuccess } from "../../utils/response";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  const dbConnected = await testDatabaseConnection();

  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? "connected" : "disconnected",
    version: process.env.npm_package_version || "1.0.0",
  });
});