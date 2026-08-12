"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Calendar, MapPin, Ticket, DollarSign, RefreshCw, Film } from "lucide-react";

import { getEvents } from "@/services/events.service";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Event } from "@/types";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

export default function OrganizerDashboardPage() {
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error("Erro ao carregar eventos", {
        description: getApiErrorMessage(error),
      });
    }
  }, [isError, error]);

  const totalEvents = events.length;
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const totalEstimatedRevenue = events.reduce(
    (acc, curr) => acc + (curr.capacity || 0) * (curr.price || 0),
    0
  );

  const columns: ColumnDef<Event>[] = [
    {
      header: "Evento",
      accessorKey: (event) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{event.title}</span>
            {event.externalRef && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0">
                <Film className="size-3" />
                TMDB: {event.externalRef}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3" /> {event.location}
          </span>
        </div>
      ),
    },
    {
      header: "Data & Hora",
      accessorKey: (event) => (
        <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
          <Calendar className="size-3.5" />
          {formatDate(event.date)}
        </span>
      ),
    },
    {
      header: "Capacidade",
      accessorKey: (event) => (
        <Badge variant="outline" className="gap-1 font-mono">
          <Ticket className="size-3" />
          {event.capacity} lugares
        </Badge>
      ),
    },
    {
      header: "Preço",
      accessorKey: (event) => (
        <span className="font-semibold text-foreground">
          {event.price === 0 ? (
            <Badge variant="success">Gratuito</Badge>
          ) : (
            formatCurrency(event.price)
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel do Organizador"
        description="Acompanhe o desempenho e gerencie a lista dos seus eventos."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Link href="/organizer/events/new">
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Novo Evento
              </Button>
            </Link>
          </div>
        }
      />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Eventos
              <Calendar className="size-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-extrabold text-foreground">
              {isLoading ? <LoadingSpinner size="sm" /> : totalEvents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Eventos cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Capacidade Total
              <Ticket className="size-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-extrabold text-foreground">
              {isLoading ? <LoadingSpinner size="sm" /> : totalCapacity.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ingressos totais ofertados
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Potencial de Receita
              <DollarSign className="size-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-extrabold text-foreground">
              {isLoading ? <LoadingSpinner size="sm" /> : formatCurrency(totalEstimatedRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimativa bruta de arrecadação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Seus Eventos Cadastrados
          </h2>
          <span className="text-xs text-muted-foreground">
            Total: {events.length} evento(s)
          </span>
        </div>

        {isError ? (
          <Card className="p-8 text-center space-y-4 border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive font-medium">
              Não foi possível carregar os eventos.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </Card>
        ) : (
          <DataTable
            data={events}
            columns={columns}
            isLoading={isLoading}
            keyExtractor={(event) => event.id}
            emptyMessage="Nenhum evento cadastrado ainda. Clique em 'Novo Evento' para criar o primeiro."
          />
        )}
      </div>
    </div>
  );
}
