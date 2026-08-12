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
  reservation: Reservation | null;
  onDecline?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  reservation,
  onDecline,
}: CheckoutModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (decision: "CONFIRM" | "DECLINE") => {
      if (!reservation) {
        throw new Error("Nenhuma reserva selecionada");
      }
      return checkoutReservation(reservation.id, { decision });
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
        toast.warning("Reserva cancelada", {
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

  if (!reservation) {
    return null;
  }

  const event = reservation.event;
  const unitPrice = event?.price ?? 0;
  const totalPrice = unitPrice * (reservation.quantity || 1);

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
              RESERVA PENDENTE
            </Badge>
          </div>

          <div className="border-t border-border pt-3 flex flex-wrap items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              <span className="text-muted-foreground">Lugar / Tipo:</span>
              <span className="font-semibold text-foreground">
                {reservation.seatCode
                  ? `Assento ${reservation.seatCode}`
                  : `${reservation.quantity} ingresso(s) Pista`}
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
