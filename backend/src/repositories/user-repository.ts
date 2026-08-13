import { type User, type Prisma } from "@prisma/client";
import { prisma } from "@/libs/prisma.js";

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: string): Promise<User>;
}

export class PrismaUserRepository implements IUserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async getByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async getById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}
