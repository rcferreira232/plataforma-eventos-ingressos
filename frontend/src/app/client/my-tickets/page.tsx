"use client";

import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Share2, Ticket as TicketIcon, Calendar, MapPin, CheckCircle2, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

import { getMyTickets } from "@/services/tickets.service";
import { getApiErrorMessage } from "@/services/api";
import { formatDate } from "@/utils/formatters";
import type { Ticket, TicketStatus } from "@/types";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const statusConfig: Record<TicketStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: typeof CheckCircle2 }> = {
  VALID: { label: "VÁLIDO", variant: "success", icon: CheckCircle2 },
  USED: { label: "UTILIZADO", variant: "secondary", icon: AlertCircle },
  CANCELLED: { label: "CANCELADO", variant: "destructive", icon: XCircle },
};

export default function MyTicketsPage() {
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Ticket[]>({
    queryKey: ["my-tickets"],
    queryFn: getMyTickets,
  });

  const handleCopyShareLink = async (ticket: Ticket) => {
    const rawLink = ticket.shareLink;
    if (!rawLink) {
      toast.error("Link de compartilhamento indisponível");
      return;
    }

    const fullUrl = rawLink.startsWith("http")
      ? rawLink
      : `${window.location.origin}${rawLink}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link do ingresso copiado!", {
        description: "O link assinado foi copiado para a área de transferência.",
      });
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Meus Ingressos"
        description="Sua carteira digital de bilhetes e QR Codes para acesso aos eventos."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar Ingressos
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Carregando seus bilhetes...</p>
        </div>
      ) : isError ? (
        <Card className="p-8 text-center space-y-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">
            Erro ao carregar ingressos: {getApiErrorMessage(error)}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </Card>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TicketIcon className="size-8" />
          </div>
          <CardTitle>Nenhum ingresso encontrado</CardTitle>
          <CardDescription>
            Você ainda não possui ingressos comprados ou confirmados.
          </CardDescription>
          <div className="pt-2">
            <Link href="/client/events">
              <Button className="gap-2">
                Explorar Catálogo de Eventos
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
            const config = statusConfig[ticket.status] || statusConfig.VALID;
            const StatusIcon = config.icon;
            const isValid = ticket.status === "VALID";

            return (
              <Card key={ticket.id} className="flex flex-col overflow-hidden border-border bg-card">
                <CardHeader className="border-b border-border bg-card/80 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        {ticket.event?.title ?? "Evento MeuIngresso"}
                      </CardTitle>
                      {ticket.event?.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="size-3.5" />
                          {ticket.event.location}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.variant} className="gap-1 text-xs">
                      <StatusIcon className="size-3" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-6 pt-6 flex flex-col items-center justify-center text-center">
                  {ticket.event?.date && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Calendar className="size-4 text-primary" />
                      <span>{formatDate(ticket.event.date)}</span>
                    </div>
                  )}

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center">
                    <QRCodeSVG
                      value={ticket.code}
                      size={160}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#0F172A"
                    />
                    <span className="mt-3 font-mono text-xs font-bold text-slate-800 tracking-wider">
                      {ticket.code.substring(0, 8)}...{ticket.code.slice(-8)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground max-w-xs">
                    Apresente este QR Code na portaria do evento para liberação de acesso.
                  </p>
                </CardContent>

                <CardFooter className="border-t border-border pt-4 bg-card/40 flex justify-between items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground truncate">
                    ID: {ticket.id.slice(0, 10)}
                  </span>

                  {isValid && ticket.shareLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyShareLink(ticket)}
                      className="gap-2 text-xs font-medium"
                    >
                      <Share2 className="size-3.5" />
                      Compartilhar Ingresso
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
