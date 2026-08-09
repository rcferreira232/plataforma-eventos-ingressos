import { type User, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/libs/prisma";

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
}

export class PrismaUserRepository implements IUserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }
}
