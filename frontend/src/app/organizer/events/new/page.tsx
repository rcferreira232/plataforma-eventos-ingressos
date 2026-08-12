"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, MapPin, Ticket, DollarSign, Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createEvent } from "@/services/events.service";
import { getApiErrorMessage } from "@/services/api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  const {
    register,
    handleSubmit,
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

  const mutation = useMutation({
    mutationFn: (data: CreateEventFormData) => {
      const isoDate = new Date(data.date).toISOString();
      return createEvent({
        title: data.title.trim(),
        date: isoDate,
        location: data.location.trim(),
        capacity: Number(data.capacity),
        price: Number(data.price),
        externalRef: data.externalRef?.trim() ? data.externalRef.trim() : undefined,
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Cadastrar Novo Evento"
        description="Preencha os dados do evento para publicá-lo na plataforma MeuIngresso."
        actions={
          <Link href="/organizer/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Voltar ao Painel
            </Button>
          </Link>
        }
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
            <CardDescription>
              Todos os campos marcados com asterisco (*) são obrigatórios.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <FormInput
              label="Título do Evento"
              placeholder="Ex: Festival de Verão 2026 / Estreia de Filme"
              required
              leftIcon={<Ticket className="size-4" />}
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Data e Hora"
                type="datetime-local"
                required
                leftIcon={<Calendar className="size-4" />}
                error={errors.date?.message}
                {...register("date")}
              />

              <FormInput
                label="Local do Evento"
                placeholder="Ex: Arena Anhembi, São Paulo - SP"
                required
                leftIcon={<MapPin className="size-4" />}
                error={errors.location?.message}
                {...register("location")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Capacidade de Ingressos"
                type="number"
                min={1}
                required
                placeholder="Ex: 500"
                helperText="Número total de ingressos disponíveis"
                leftIcon={<Ticket className="size-4" />}
                error={errors.capacity?.message}
                {...register("capacity")}
              />

              <FormInput
                label="Preço do Ingresso (R$)"
                type="number"
                step="0.01"
                min={0}
                required
                placeholder="0.00"
                helperText="Defina 0 para eventos gratuitos"
                leftIcon={<DollarSign className="size-4" />}
                error={errors.price?.message}
                {...register("price")}
              />
            </div>

            <FormInput
              label="ID Externo (TMDB) - Opcional"
              placeholder="Ex: 550988"
              helperText="Identificador do filme ou série no TMDB para sincronização de catálogo"
              leftIcon={<Film className="size-4" />}
              error={errors.externalRef?.message}
              {...register("externalRef")}
            />
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
            <Link href="/organizer/dashboard">
              <Button type="button" variant="outline" disabled={mutation.isPending}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Salva do Evento...
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
