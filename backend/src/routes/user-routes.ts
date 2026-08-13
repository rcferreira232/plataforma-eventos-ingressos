import { Router } from "express";
import { PrismaUserRepository } from "@/repositories/user-repository.js";
import { UserService } from "@/services/user-service.js";
import { UserController } from "@/controllers/user-controller.js";

import { validate } from "@/middlewares/validate-middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
} from "@/schemas/user-schemas.js";

const userRouter: Router = Router();

const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/login", validate(loginUserSchema), userController.login);
userRouter.post("/", validate(createUserSchema), userController.create);
userRouter.get("/", userController.getAll);
userRouter.get("/:id", userController.getById);
userRouter.put("/:id", validate(updateUserSchema), userController.update);
userRouter.delete("/:id", userController.delete);

export { userRouter };
