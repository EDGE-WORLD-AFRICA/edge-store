import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/dbconnection";
import { config } from "../config";
import { sendError } from "../utils/response";

export interface IAuthPayload {
  userId: string;
  username: string;
  companyId: string;
  branchId?: string;
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      auth?: IAuthPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "No token provided", 401);
  }

  const token = authHeader.substring(7);

  try{
    const decoded = jwt.verify(token, config.jwt.secret) as IAuthPayload;

    const user = await db("user_accounts")
    .where("id", decoded.userId)
    .where("is_active", true)
    .where("voided", false)
    .first();

    if(!user) return sendError(res, "User is inactive or not found", 401);

    req.auth = decoded;
    next();
  }catch{
    return sendError(res, "Invalid or expired token", 401);
  }
}; 

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if(!req.auth?.isSuperAdmin){
    return sendError(res, "Super admin privileges required", 403);
  }
  next();
}