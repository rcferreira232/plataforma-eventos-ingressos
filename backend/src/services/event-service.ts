import { type Event } from "@/generated/prisma/client";
import { type IEventRepository } from "@/repositories/event-repository";
import { type CreateEventInput } from "@/schemas/event-schemas";
import { NotFoundError } from "@/libs/errors";
import { TMDBService } from "./external/tmdb-service";

export class EventService {
  constructor(private eventRepository: IEventRepository) {}

  async createEvent(
    data: CreateEventInput,
    organizerId: string,
  ): Promise<Event> {
    if (data.externalRef) {
      const movieDetails = await TMDBService.getMovieDetails(data.externalRef);
      if (!movieDetails) {
        throw new NotFoundError(
          `Movie with external reference ${data.externalRef} not found in TMDB`,
        );
      }

      data.title = movieDetails.title;
    }

    return this.eventRepository.create({
      title: data.title,
      date: new Date(data.date),
      location: data.location,
      capacity: data.capacity,
      price: data.price,
      externalRef: data.externalRef ?? null,
      organizerId,
    });
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.getAll();
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.getById(id);
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    return event;
  }
}
