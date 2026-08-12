"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { getEvents } from "@/services/events.service";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Event } from "@/types";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/ui/form-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";

export default function ClientEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container size='xl' className='py-8 space-y-8'>
      <PageHeader
        title='Catálogo de Eventos'
        description='Escolha seu evento favorito, explore o mapa de assentos e garanta seus ingressos.'
      />

      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border'>
        <FormInput
          placeholder='Buscar por título ou cidade...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className='size-4' />}
          containerClassName='max-w-md'
        />
        <span className='text-xs text-muted-foreground font-medium'>
          {filteredEvents.length} evento(s) encontrado(s)
        </span>
      </div>

      {isLoading ? (
        <div className='flex flex-col items-center justify-center min-h-[40vh] gap-3'>
          <LoadingSpinner size='lg' />
          <p className='text-sm text-muted-foreground'>
            Buscando eventos disponíveis...
          </p>
        </div>
      ) : isError ? (
        <Card className='p-8 text-center space-y-4 border-destructive/30 bg-destructive/5'>
          <p className='text-sm text-destructive font-medium'>
            Erro ao carregar catálogo: {getApiErrorMessage(error)}
          </p>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className='p-12 text-center space-y-3'>
          <CardTitle>Nenhum evento disponível</CardTitle>
          <CardDescription>
            Tente buscar com outros termos ou volte mais tarde.
          </CardDescription>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredEvents.map((event) => {
            const posterUrl = event.posterPath
              ? `https://image.tmdb.org/t/p/w500${event.posterPath}`
              : null;

            return (
              <Card
                key={event.id}
                className='flex flex-col justify-between overflow-hidden hover:border-primary/50 transition-all'
              >
                {posterUrl && (
                  <div className='relative h-48 w-full bg-muted overflow-hidden'>
                    <Image
                      src={posterUrl}
                      alt={event.title}
                      fill
                      className='object-cover'
                    />
                    {event.voteAverage && (
                      <div className='absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 text-xs font-bold flex items-center gap-1'>
                        <Sparkles className='size-3 fill-amber-400 text-amber-400' />
                        {event.voteAverage.toFixed(1)}
                      </div>
                    )}
                  </div>
                )}
                <CardHeader className={posterUrl ? "pt-4" : ""}>
                  <div className='flex items-start justify-between gap-2'>
                    <CardTitle className='text-lg leading-snug'>
                      {event.title}
                    </CardTitle>
                    {event.externalRef && (
                      <Badge variant='secondary' className='text-[10px]'>
                        TMDB
                      </Badge>
                    )}
                  </div>
                  <CardDescription className='flex items-center gap-1 mt-1'>
                    <MapPin className='size-3.5 shrink-0' />
                    {event.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-3 text-sm'>
                  {event.overview && (
                    <p className='text-xs text-muted-foreground line-clamp-2'>
                      {event.overview}
                    </p>
                  )}
                  <div className='flex items-center gap-1.5 text-muted-foreground'>
                    <Calendar className='size-4 text-primary' />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className='flex items-center justify-between pt-2 border-t border-border'>
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                      <TicketIcon className='size-3.5' />
                      Capacidade: {event.capacity}
                    </span>
                    <span className='text-lg font-bold text-foreground'>
                      {event.price === 0
                        ? "Gratuito"
                        : formatCurrency(event.price)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className='pt-2'>
                  <Link href={`/client/events/${event.id}`} className='w-full'>
                    <Button className='w-full gap-2 font-semibold'>
                      <Sparkles className='size-4' />
                      Ver Detalhes & Reservar
                      <ArrowRight className='size-4 ml-auto' />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
