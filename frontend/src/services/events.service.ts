import { api } from "./api";
import type { Event } from "@/types";

export interface CreateEventPayload {
  title: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  externalRef?: string;
  externalId?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage?: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

export async function getPopularMovies(page = 1) {
  const response = await api.get<import("@/types").TMDBMovie[]>(
    `/tmdb/popular?page=${page}`,
  );
  return response.data;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const response = await api.post<ApiResponse<Event>>("/events", payload);
  return response.data.data;
}

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<ApiResponse<Event[]>>("/events");
  return response.data.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
  return response.data.data;
}
