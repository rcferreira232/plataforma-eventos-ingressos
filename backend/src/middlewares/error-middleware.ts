import {
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { AppError } from "../libs/errors.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.issues.map((error) => ({
        path: error.path.join("."),
        message: error.message,
      })),
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
