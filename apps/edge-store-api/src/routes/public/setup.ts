import { Router } from "express";
import { setupController } from "../../controllers/setupController";

export const setupRouter = Router();

setupRouter.get("/admin-exists", setupController.adminExists);
setupRouter.post("/complete", setupController.completeSetup);
setupRouter.get("/companies", setupController.getCompanies);