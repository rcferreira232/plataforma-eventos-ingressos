"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Film,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

import { getEventById } from "@/services/events.service";
import { createReservation } from "@/services/reservations.service";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Event, Reservation } from "@/types";

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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  SeatSelector,
  ReservationType,
} from "@/components/events/seat-selector";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import Image from "next/image";

interface EventDetailsContentProps {
  id: string;
}

function EventDetailsContent({ id }: EventDetailsContentProps) {
  const queryClient = useQueryClient();

  const [selection, setSelection] = useState<{
    type: ReservationType;
    quantity: number;
    seatCode?: string;
  }>({
    type: "pista",
    quantity: 1,
  });

  const [activeReservation, setActiveReservation] =
    useState<Reservation | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: Boolean(id),
  });

  const reserveMutation = useMutation({
    mutationFn: () => {
      if (!event) {
        throw new Error("Evento não encontrado");
      }
      if (selection.type === "seat" && !selection.seatCode) {
        throw new Error(
          "Por favor, selecione um assento no mapa antes de prosseguir.",
        );
      }

      return createReservation({
        eventId: event.id,
        quantity: selection.quantity,
        seatCode: selection.type === "seat" ? selection.seatCode : undefined,
      });
    },
    onSuccess: (reservation) => {
      setActiveReservation(reservation);
      setIsCheckoutOpen(true);
      toast.success("Reserva realizada com sucesso!", {
        description:
          "Seu assento foi garantido. Conclua o checkout para emitir os bilhetes.",
      });
    },
    onError: (err) => {
      // Trata o Requisito Crítico de Concorrência: 409 Conflict
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("Este assento acabou de ser reservado por outro cliente", {
          description:
            "Por favor, escolha outro lugar disponível no mapa de assentos.",
        });

        // Invalida cache e força o cliente a escolher outro assento
        queryClient.invalidateQueries({ queryKey: ["event", id] });
        setSelection((prev) => ({ ...prev, seatCode: undefined }));
      } else {
        toast.error("Erro ao realizar reserva", {
          description: getApiErrorMessage(err),
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] gap-3'>
        <LoadingSpinner size='lg' />
        <p className='text-sm text-muted-foreground'>
          Carregando detalhes do evento...
        </p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <Card className='p-8 text-center space-y-4 max-w-lg mx-auto border-destructive/30 bg-destructive/5'>
        <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
          <AlertTriangle className='size-6' />
        </div>
        <CardTitle>Evento Não Encontrado</CardTitle>
        <CardDescription>
          {error
            ? getApiErrorMessage(error)
            : "Não foi possível carregar as informações deste evento."}
        </CardDescription>
        <div className='pt-2'>
          <Button variant='outline' onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  const isSeatTypeWithoutCode =
    selection.type === "seat" && !selection.seatCode;

  const totalPrice =
    event.price * (selection.type === "pista" ? selection.quantity : 1);

  return (
    <div className='space-y-8 max-w-4xl mx-auto'>
      <PageHeader
        title={event.title}
        description='Confira as informações completas e selecione seus lugares para reservar.'
        actions={
          <Link href='/client/events'>
            <Button variant='outline' size='sm' className='gap-2'>
              <ArrowLeft className='size-4' />
              Voltar aos Eventos
            </Button>
          </Link>
        }
      />

      {/* Hero / Banner do Evento (se houver backdrop ou poster) */}
      {event.backdropPath || event.posterPath ? (
        <div className='relative rounded-2xl overflow-hidden border border-border bg-card shadow-lg'>
          {event.backdropPath ? (
            <div className='relative h-64 sm:h-80 w-full overflow-hidden'>
              <Image
                src={`https://image.tmdb.org/t/p/w1280${event.backdropPath}`}
                alt={event.title}
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent' />
            </div>
          ) : null}

          <div
            className={`p-6 flex flex-col sm:flex-row gap-6 items-start ${event.backdropPath ? "-mt-24 relative z-10" : ""}`}
          >
            {event.posterPath && (
              <Image
                src={`https://image.tmdb.org/t/p/w500${event.posterPath}`}
                alt={event.title}
                className='w-36 h-52 object-cover rounded-xl shadow-2xl border-2 border-border shrink-0'
              />
            )}
            <div className='space-y-3 flex-1'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h1 className='text-3xl font-black text-foreground'>
                  {event.title}
                </h1>
                {event.voteAverage && (
                  <Badge
                    variant='secondary'
                    className='gap-1 bg-black/60 backdrop-blur-md text-amber-400 font-bold border-amber-400/30 px-3 py-1'
                  >
                    <Sparkles className='size-3.5 fill-amber-400 text-amber-400' />
                    TMDB {event.voteAverage.toFixed(1)} / 10
                  </Badge>
                )}
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {event.overview || "Sem sinopse detalhada fornecida."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Card de Detalhes do Evento */}
      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <CardTitle className='text-2xl'>{event.title}</CardTitle>
              <CardDescription className='flex items-center gap-1.5 mt-1'>
                <MapPin className='size-4 text-primary' />
                {event.location}
              </CardDescription>
            </div>

            {event.externalRef && (
              <Badge variant='secondary' className='gap-1 px-3 py-1'>
                <Film className='size-3.5' />
                TMDB Ref: {event.externalRef}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card/60 border border-border'>
            <div>
              <span className='text-xs text-muted-foreground block'>
                Data e Hora
              </span>
              <span className='text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5'>
                <Calendar className='size-3.5 text-primary' />
                {formatDate(event.date)}
              </span>
            </div>

            <div>
              <span className='text-xs text-muted-foreground block'>
                Capacidade Total
              </span>
              <span className='text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5'>
                <TicketIcon className='size-3.5 text-emerald-400' />
                {event.capacity} lugares
              </span>
            </div>

            <div>
              <span className='text-xs text-muted-foreground block'>
                Valor Unitário
              </span>
              <span className='text-sm font-bold text-foreground mt-0.5 block'>
                {event.price === 0 ? "Gratuito" : formatCurrency(event.price)}
              </span>
            </div>
          </div>

          {/* Componente de Seleção de Ingressos e Assentos */}
          <div className='space-y-3 pt-2'>
            <h3 className='text-base font-bold text-foreground'>
              Selecione o Tipo de Ingresso ou Assento
            </h3>
            <SeatSelector
              onSelectionChange={(newSelection) => setSelection(newSelection)}
              disabled={reserveMutation.isPending}
            />
          </div>
        </CardContent>

        <CardFooter className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 bg-card/40'>
          <div>
            <span className='text-xs text-muted-foreground block'>
              Total a Pagar:
            </span>
            <span className='text-2xl font-extrabold text-foreground'>
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <Button
            size='lg'
            disabled={reserveMutation.isPending || isSeatTypeWithoutCode}
            onClick={() => reserveMutation.mutate()}
            className='w-full sm:w-auto gap-2 font-bold px-8 bg-primary hover:bg-primary/90 text-primary-foreground'
          >
            {reserveMutation.isPending ? (
              <>
                <LoadingSpinner size='sm' />
                Processando Reserva...
              </>
            ) : (
              <>
                <Sparkles className='size-5' />
                Reservar Ingresso
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de Checkout Simulado */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        reservation={activeReservation}
      />
    </div>
  );
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Container size='xl' className='py-8'>
      <Suspense
        fallback={
          <div className='flex justify-center py-20'>
            <LoadingSpinner size='lg' />
          </div>
        }
      >
        <EventDetailsContent id={resolvedParams.id} />
      </Suspense>
    </Container>
  );
}
