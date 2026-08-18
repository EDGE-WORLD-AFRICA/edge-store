import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = "Error",
  statusCode: number = 500,
  errors?: any
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const sendCreated = (res: Response, data: any, message: string = "Created") => {
  sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
  res.status(204).send();
};