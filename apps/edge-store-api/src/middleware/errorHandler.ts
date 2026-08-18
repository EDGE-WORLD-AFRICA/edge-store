import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return sendError(res, "CORS policy violation", 403);
  }

  if (err.message.includes("JWT")) {
    return sendError(res, "Invalid or expired token", 401);
  }

  sendError(res, err.message || "Internal server error", 500);
};