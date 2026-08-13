import { type Request, type Response, type NextFunction } from "express";
import { type UserService } from "@/services/user-service.js";
import {
  type CreateUserInput,
  type UpdateUserInput,
  type LoginUserInput,
} from "@/schemas/user-schemas.js";
import { BadRequestError } from "@/libs/errors.js";

export class UserController {
  constructor(private userService: UserService) {}

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = req.body as LoginUserInput;
      const result = await this.userService.login(validatedData);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = req.body as CreateUserInput;
      const user = await this.userService.createUser(validatedData);
      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.userService.getAll();
      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        throw new BadRequestError("Missing or invalid user ID");
      }
      const user = await this.userService.getUserById(id);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        throw new BadRequestError("Missing or invalid user ID");
      }
      const validatedData = req.body as UpdateUserInput;
      const user = await this.userService.updateUser(id, validatedData);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        throw new BadRequestError("Missing or invalid user ID");
      }
      await this.userService.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
