import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UnauthorizedError, ForbiddenError } from "@/libs/errors";
import { Role } from "@prisma/client";

type JwtPayload = {
  id: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (allowedRoles?: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing or invalid authorization header");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new UnauthorizedError("Token not found");
      }

      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(decoded.role)) {
          throw new ForbiddenError("Forbidden: insufficient permissions");
        }
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new UnauthorizedError("Invalid token"));
      } else {
        next(error);
      }
    }
  };
};
