import { Router } from "express";
import { PrismaUserRepository } from "@/repositories/user-repository";
import { UserService } from "@/services/user-service";
import { UserController } from "@/controllers/user-controller";

const userRouter: Router = Router();

const userRepository = new PrismaUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("/", userController.create);

export { userRouter };
