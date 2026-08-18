import type { Request, Response, NextFunction } from "express";
import { setupService } from "../services/setupService";
import { sendSuccess, sendError, sendCreated } from "../utils/response";

export const setupController = {
  adminExists: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exists = await setupService.adminExists();
      sendSuccess(res, { exists });
    } catch (error: any) {
      next(error);
    }
  },

  completeSetup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await setupService.completeSetup(req.body);
      sendCreated(res, result, "Setup completed successfully");
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
      next(error);
    }
  },

  getCompanies: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await setupService.getCompanies();
      sendSuccess(res, companies);
    } catch (error: any) {
      next(error);
    }
  },
};