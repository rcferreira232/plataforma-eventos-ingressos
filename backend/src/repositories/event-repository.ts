import { type Event, type Prisma } from "@prisma/client";
import { prisma } from "@/libs/prisma";

export interface IEventRepository {
  create(data: Prisma.EventUncheckedCreateInput): Promise<Event>;
  getAll(): Promise<Event[]>;
  getById(id: string): Promise<Event | null>;
}

export class PrismaEventRepository implements IEventRepository {
  async create(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return prisma.event.create({ data });
  }

  async getAll(): Promise<Event[]> {
    return prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
