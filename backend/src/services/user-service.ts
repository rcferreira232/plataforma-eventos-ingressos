import crypto from "crypto";
import jwt from "jsonwebtoken";
import { type User, type Prisma } from "@prisma/client";
import { type IUserRepository } from "@/repositories/user-repository";
import {
  type CreateUserInput,
  type UpdateUserInput,
  type LoginUserInput,
} from "@/schemas/user-schemas";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/libs/errors";
import { env } from "@/config/env";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async login(data: LoginUserInput): Promise<{ token: string }> {
    const user = await this.userRepository.getByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const [salt, hash] = user.password.split(":");
    if (!salt || !hash) {
      throw new UnauthorizedError("Invalid user password format");
    }

    const hashVerify = crypto
      .pbkdf2Sync(data.password, salt, 1000, 64, "sha512")
      .toString("hex");

    if (hash !== hashVerify) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "1d" },
    );

    return { token };
  }

  async createUser(data: CreateUserInput): Promise<Omit<User, "password">> {
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(data.password, salt, 1000, 64, "sha512")
      .toString("hex");
    const hashedPassword = `${salt}:${hash}`;

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAll(): Promise<Omit<User, "password">[]> {
    const users = await this.userRepository.getAll();
    return users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
  }

  async getUserById(id: string): Promise<Omit<User, "password">> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: string,
    data: UpdateUserInput,
  ): Promise<Omit<User, "password">> {
    const existingUser = await this.userRepository.getById(id);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await this.userRepository.getByEmail(data.email);
      if (emailInUse) {
        throw new ConflictError("Email already in use");
      }
    }

    let hashedPassword = existingUser.password;
    if (data.password) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto
        .pbkdf2Sync(data.password, salt, 1000, 64, "sha512")
        .toString("hex");
      hashedPassword = `${salt}:${hash}`;
    }

    const updateData: Prisma.UserUpdateInput = {
      password: hashedPassword,
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    const updatedUser = await this.userRepository.update(id, updateData);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.getById(id);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }
    await this.userRepository.delete(id);
  }
}
