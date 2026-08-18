import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { sendSuccess, sendError } from "../utils/response";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, deviceId, deviceName, machineCode } = req.body;

      if (!username || !password) {
        return sendError(res, "Username and password are required", 400);
      }

      const result = await authService.login({
        username,
        password,
        deviceId,
        deviceName,
        machineCode,
      });

      sendSuccess(res, result, "Login successful");
    } catch (error: any) {
      if (error.message === "Invalid username or password") {
        return sendError(res, error.message, 401);
      }
      next(error);
    }
  },

  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, "No token provided", 401);
      }

      const token = authHeader.substring(7);
      const decoded = await authService.verifyToken(token);

      if (!decoded) {
        return sendError(res, "Invalid or expired token", 401);
      }

      sendSuccess(res, { valid: true, user: decoded });
    } catch (error: any) {
      next(error);
    }
  },
};