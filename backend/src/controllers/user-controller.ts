import { type Request, type Response, type NextFunction } from "express";
import { type UserService } from "@/services/user-service";
import { createUserSchema } from "@/schemas/user-schemas";

export class UserController {
  constructor(private userService: UserService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(validatedData);
      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
