import { Router } from "express";
import { healthRouter } from "./health";
import { setupRouter } from "./setup";
import { authRouter } from "./auth";

const router = Router();

router.use("/health", healthRouter);
router.use("/setup", setupRouter);
router.use("/auth", authRouter);

export { router as publicRouters };