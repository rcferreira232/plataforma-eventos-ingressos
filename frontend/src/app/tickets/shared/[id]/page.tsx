"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Ticket as TicketIcon, Calendar, MapPin, CheckCircle2, AlertCircle, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { getSharedTicket } from "@/services/tickets.service";
import { getApiErrorMessage } from "@/services/api";
import { formatDate } from "@/utils/formatters";
import type { Ticket, TicketStatus } from "@/types";

import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const statusConfig: Record<TicketStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: typeof CheckCircle2 }> = {
  VALID: { label: "VÁLIDO", variant: "success", icon: CheckCircle2 },
  USED: { label: "UTILIZADO", variant: "secondary", icon: AlertCircle },
  CANCELLED: { label: "CANCELADO", variant: "destructive", icon: XCircle },
};

interface SharedTicketContentProps {
  id: string;
}

function SharedTicketContent({ id }: SharedTicketContentProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    data: ticket,
    isLoading,
    isError,
    error,
  } = useQuery<Ticket>({
    queryKey: ["shared-ticket", id, token],
    queryFn: () => getSharedTicket(id, token),
    enabled: Boolean(id && token),
  });

  if (!token) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border-destructive/30 bg-destructive/5">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-6" />
        </div>
        <CardTitle>Token de Compartilhamento Inválido</CardTitle>
        <CardDescription>
          Este link de ingresso não possui uma assinatura válida ou está incompleto.
        </CardDescription>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline">Ir para a Página Inicial</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Validando e carregando ingresso compartilhado...</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border-destructive/30 bg-destructive/5">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-6" />
        </div>
        <CardTitle>Ingresso Não Encontrado</CardTitle>
        <CardDescription>
          {error ? getApiErrorMessage(error) : "Não foi possível validar este ingresso compartilhado."}
        </CardDescription>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const config = statusConfig[ticket.status] || statusConfig.VALID;
  const StatusIcon = config.icon;

  return (
    <Card className="max-w-lg mx-auto border-border bg-card overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border bg-card/80 text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
          <ShieldCheck className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Ingresso Autenticado via HMAC
          </span>
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          {ticket.event?.title ?? "Ingresso Compartilhado"}
        </CardTitle>
        {ticket.event?.location && (
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="size-3.5" />
            {ticket.event.location}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-6 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2">
          <Badge variant={config.variant} className="gap-1 px-3 py-1 text-sm font-semibold">
            <StatusIcon className="size-4" />
            {config.label}
          </Badge>
        </div>

        {ticket.event?.date && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Calendar className="size-4 text-primary" />
            <span>{formatDate(ticket.event.date)}</span>
          </div>
        )}

        <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center">
          <QRCodeSVG
            value={ticket.code}
            size={180}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#0F172A"
          />
          <span className="mt-3 font-mono text-xs font-bold text-slate-800 tracking-wider">
            {ticket.code.substring(0, 8)}...{ticket.code.slice(-8)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground max-w-xs">
          Apresente este bilhete com QR Code na portaria oficial do evento para liberação de entrada.
        </p>
      </CardContent>

      <CardFooter className="border-t border-border py-4 bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-mono">Código: {ticket.code.substring(0, 13)}...</span>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <TicketIcon className="size-3.5" />
            MeuIngresso Platform
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function SharedTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Container size="md" className="py-12">
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <SharedTicketContent id={resolvedParams.id} />
      </Suspense>
    </Container>
  );
}
