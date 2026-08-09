import { type User } from "@/generated/prisma/client";
import { type IUserRepository } from "@/repositories/user-repository";
import { type CreateUserInput } from "@/schemas/user-schemas";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const user = await this.userRepository.create({
      name: data.name,
    });

    return user;
  }
}
