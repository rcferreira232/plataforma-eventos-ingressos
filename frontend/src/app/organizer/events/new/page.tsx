"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Film,
  ArrowLeft,
  Star,
} from "lucide-react";
import Link from "next/link";

import { createEvent } from "@/services/events.service";
import { getApiErrorMessage } from "@/services/api";
import { TMDBMovie } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TmdbPopularSelector } from "@/components/organizer/tmdb-popular-selector";

const createEventSchema = z.object({
  title: z.string().min(1, "O título do evento é obrigatório"),
  date: z.string().min(1, "A data e hora do evento são obrigatórias"),
  location: z.string().min(1, "O local do evento é obrigatório"),
  capacity: z.coerce
    .number({ invalid_type_error: "Informe um número válido para capacidade" })
    .int("A capacidade deve ser um número inteiro")
    .positive("A capacidade deve ser maior que zero"),
  price: z.coerce
    .number({ invalid_type_error: "Informe um valor de preço válido" })
    .min(0, "O preço não pode ser negativo"),
  externalRef: z.string().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      capacity: 100,
      price: 0,
      externalRef: "",
    },
  });

  const handleSelectMovie = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setValue("title", movie.title, { shouldValidate: true });
    setValue("externalRef", String(movie.id));
    toast.info(`Filme "${movie.title}" selecionado!`, {
      description:
        "Título e metadados do TMDB preenchidos automaticamente no formulário.",
    });
  };

  const mutation = useMutation({
    mutationFn: (data: CreateEventFormData) => {
      const isoDate = new Date(data.date).toISOString();
      return createEvent({
        title: data.title.trim(),
        date: isoDate,
        location: data.location.trim(),
        capacity: Number(data.capacity),
        price: Number(data.price),
        externalRef: data.externalRef?.trim()
          ? data.externalRef.trim()
          : selectedMovie
            ? String(selectedMovie.id)
            : undefined,
        externalId: selectedMovie ? String(selectedMovie.id) : undefined,
        overview: selectedMovie?.overview || undefined,
        posterPath: selectedMovie?.posterPath || undefined,
        backdropPath: selectedMovie?.backdropPath || undefined,
        voteAverage: selectedMovie?.voteAverage || undefined,
      });
    },
    onSuccess: (newEvent) => {
      toast.success("Evento cadastrado com sucesso!", {
        description: `O evento "${newEvent.title}" foi criado e já está disponível.`,
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/organizer/dashboard");
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error("Falha ao cadastrar evento", {
        description: message,
      });
    },
  });

  const onSubmit = (data: CreateEventFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto pb-12'>
      <PageHeader
        title='Cadastrar Novo Evento'
        description='Selecione um filme do catálogo TMDB ou preencha manualmente os dados do evento.'
        actions={
          <Link href='/organizer/dashboard'>
            <Button variant='outline' size='sm' className='gap-2'>
              <ArrowLeft className='size-4' />
              Voltar ao Painel
            </Button>
          </Link>
        }
      />

      {/* Componente de Seleção do TMDB */}
      <TmdbPopularSelector
        onSelectMovie={handleSelectMovie}
        selectedMovieId={selectedMovie?.id}
      />

      {/* Card com Detalhes do Filme Selecionado se houver */}
      {selectedMovie && (
        <Card className='border-primary/50 bg-primary/5 overflow-hidden'>
          <CardHeader className='py-3 bg-primary/10 border-b border-primary/20'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2'>
              <Film className='size-4 text-primary' />
              Filme Selecionado do TMDB
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 flex flex-col sm:flex-row gap-4 items-start'>
            {selectedMovie.posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.posterPath}`}
                alt={selectedMovie.title}
                width={200}
                height={300}
                className='w-24 h-36 object-cover rounded-lg shadow-md shrink-0 border border-border'
              />
            ) : (
              <div className='w-24 h-36 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs shrink-0'>
                Sem Capa
              </div>
            )}
            <div className='space-y-2 flex-1'>
              <div className='flex items-center justify-between'>
                <h4 className='font-bold text-lg'>{selectedMovie.title}</h4>
                <div className='flex items-center gap-1 text-amber-400 font-bold text-sm bg-black/40 px-2 py-0.5 rounded'>
                  <Star className='size-3.5 fill-amber-400' />
                  {selectedMovie.voteAverage?.toFixed(1) ?? "N/A"}
                </div>
              </div>
              <p className='text-xs text-muted-foreground line-clamp-3'>
                {selectedMovie.overview || "Sem sinopse."}
              </p>
              <div className='text-xs text-muted-foreground pt-1'>
                ID TMDB: <span className='font-mono'>{selectedMovie.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Criação de Evento */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Dados Presenciais / Específicos do Evento</CardTitle>
            <CardDescription>
              Preencha a data, local, capacidade e preço dos ingressos para o
              evento.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-5'>
            <FormInput
              label='Título do Evento'
              placeholder='Ex: Festival de Verão 2026 / Estreia de Filme'
              required
              leftIcon={<Ticket className='size-4' />}
              error={errors.title?.message}
              {...register("title")}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormInput
                label='Data e Hora do Evento'
                type='datetime-local'
                required
                leftIcon={<Calendar className='size-4' />}
                error={errors.date?.message}
                {...register("date")}
              />

              <FormInput
                label='Local / Sala do Evento'
                placeholder='Ex: Sala 3 - Cinemark Metro Santa Cruz, São Paulo - SP'
                required
                leftIcon={<MapPin className='size-4' />}
                error={errors.location?.message}
                {...register("location")}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormInput
                label='Capacidade de Assentos / Ingressos'
                type='number'
                min={1}
                required
                placeholder='Ex: 150'
                helperText='Quantidade total de assentos disponíveis'
                leftIcon={<Ticket className='size-4' />}
                error={errors.capacity?.message}
                {...register("capacity")}
              />

              <FormInput
                label='Preço do Ingresso (R$)'
                type='number'
                step='0.01'
                min={0}
                required
                placeholder='0.00'
                helperText='Defina 0 para sessões gratuitas'
                leftIcon={<DollarSign className='size-4' />}
                error={errors.price?.message}
                {...register("price")}
              />
            </div>

            <FormInput
              label='ID Externo (TMDB) - Opcional'
              placeholder='Ex: 969681'
              helperText='Identificador numérico do filme no TMDB'
              leftIcon={<Film className='size-4' />}
              error={errors.externalRef?.message}
              {...register("externalRef")}
            />
          </CardContent>

          <CardFooter className='flex justify-end gap-3 pt-4 border-t border-border mt-2'>
            <Link href='/organizer/dashboard'>
              <Button
                type='button'
                variant='outline'
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type='submit'
              disabled={mutation.isPending}
              className='gap-2'
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size='sm' />
                  Salvando Evento...
                </>
              ) : (
                "Cadastrar Evento"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
