import { Router } from "express";
import { PrismaUserRepository } from "@/repositories/user-repository";
import { UserService } from "@/services/user-service";
import { UserController } from "@/controllers/user-controller";

import { validate } from "@/middlewares/validate-middleware";
import { createUserSchema, updateUserSchema } from "@/schemas/user-schemas";

const userRouter: Router = Router();

const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", validate(createUserSchema), userController.create);
userRouter.get("/", userController.getAll);
userRouter.get("/:id", userController.getById);
userRouter.put("/:id", validate(updateUserSchema), userController.update);
userRouter.delete("/:id", userController.delete);

export { userRouter };
