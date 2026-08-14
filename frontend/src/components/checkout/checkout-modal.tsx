"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle, CreditCard, Ticket, Calendar, MapPin } from "lucide-react";

import { checkoutReservation } from "@/services/reservations.service";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Reservation } from "@/types";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[] | null;
  onDecline?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  reservations,
  onDecline,
}: CheckoutModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const activeReservations = reservations ?? [];

  const mutation = useMutation({
    mutationFn: async (decision: "CONFIRM" | "DECLINE") => {
      if (activeReservations.length === 0) {
        throw new Error("Nenhuma reserva selecionada");
      }
      const results = [];
      for (const res of activeReservations) {
        const result = await checkoutReservation(res.id, { decision });
        results.push(result);
      }
      return results;
    },
    onSuccess: (data, decision) => {
      if (decision === "CONFIRM") {
        toast.success("Pagamento confirmado com sucesso!", {
          description: "Seus ingressos foram gerados e já estão disponíveis na sua carteira.",
        });
        queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        onClose();
        router.push("/client/my-tickets");
      } else {
        toast.warning("Reserva(s) cancelada(s)", {
          description: "O pagamento foi recusado e os assentos foram liberados.",
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        onClose();
        if (onDecline) {
          onDecline();
        }
      }
    },
    onError: (error) => {
      toast.error("Erro ao processar checkout", {
        description: getApiErrorMessage(error),
      });
    },
  });

  if (!reservations || activeReservations.length === 0) {
    return null;
  }

  const firstRes = activeReservations[0];
  const event = firstRes.event;
  const unitPrice = event?.price ?? 0;
  const seatCodes = activeReservations
    .map((r) => r.seatCode)
    .filter((s): s is string => Boolean(s));
  const totalPrice = unitPrice * activeReservations.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout Simulado de Ingressos"
      description="Confirme os dados da sua reserva e escolha se deseja finalizar o pagamento."
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("DECLINE")}
            className="w-full sm:w-auto gap-2"
          >
            {mutation.isPending && mutation.variables === "DECLINE" ? (
              <LoadingSpinner size="sm" />
            ) : (
              <XCircle className="size-4" />
            )}
            Recusar Pagamento
          </Button>

          <Button
            type="button"
            variant="default"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("CONFIRM")}
            className="w-full sm:w-auto gap-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {mutation.isPending && mutation.variables === "CONFIRM" ? (
              <LoadingSpinner size="sm" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Confirmar Pagamento ({formatCurrency(totalPrice)})
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <div className="rounded-xl border border-border bg-card/80 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-foreground">
                {event?.title ?? "Evento Reservado"}
              </h4>
              {event?.date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="size-3.5" />
                  {formatDate(event.date)}
                </p>
              )}
              {event?.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5" />
                  {event.location}
                </p>
              )}
            </div>
            <Badge variant="warning" className="text-xs uppercase">
              {activeReservations.length > 1
                ? `${activeReservations.length} RESERVAS PENDENTES`
                : "RESERVA PENDENTE"}
            </Badge>
          </div>

          <div className="border-t border-border pt-3 flex flex-wrap items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              <span className="text-muted-foreground">Lugar(es):</span>
              <span className="font-semibold text-foreground">
                {seatCodes.length > 0
                  ? `Assento(s) ${seatCodes.join(", ")}`
                  : `${activeReservations.length} ingresso(s)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-base font-bold text-foreground">
              <CreditCard className="size-4 text-emerald-400" />
              {formatCurrency(totalPrice)}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          * Este é um ambiente de simulação. Clique em &quot;Confirmar Pagamento&quot; para emitir os bilhetes ou &quot;Recusar Pagamento&quot; para cancelar.
        </p>
      </div>
    </Modal>
  );
}
