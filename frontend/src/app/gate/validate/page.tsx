"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Scan, KeyRound, Ticket as TicketIcon } from "lucide-react";

import { getEvents } from "@/services/events.service";
import { validateTicketEntry, GateValidationResult, GateValidationStatus } from "@/services/tickets.service";
import { getApiErrorMessage } from "@/services/api";
import type { User, Event } from "@/types";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect, SelectOption } from "@/components/ui/form-select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QrScanner } from "@/components/gate/qr-scanner";

let cachedRawUser: string | null = null;
let cachedParsedUser: User | null = null;

function emptySubscribe() {
  return () => {};
}

function getStoredUserSnapshot(): User | null {
  if (typeof window === "undefined") return null;
  const rawUser = localStorage.getItem("meu-ingresso-user");

  if (rawUser === cachedRawUser) {
    return cachedParsedUser;
  }

  cachedRawUser = rawUser;
  if (!rawUser) {
    cachedParsedUser = null;
    return null;
  }

  try {
    cachedParsedUser = JSON.parse(rawUser) as User;
    return cachedParsedUser;
  } catch {
    cachedParsedUser = null;
    return null;
  }
}

function getServerSnapshot(): User | null {
  return null;
}

function useGatekeeperUser() {
  return useSyncExternalStore(emptySubscribe, getStoredUserSnapshot, getServerSnapshot);
}

const statusStyles: Record<
  GateValidationStatus,
  {
    bgClass: string;
    borderClass: string;
    textClass: string;
    title: string;
    icon: typeof CheckCircle2;
  }
> = {
  VALID: {
    bgClass: "bg-emerald-950/40",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-400",
    title: "ENTRADA LIBERADA",
    icon: CheckCircle2,
  },
  ALREADY_USED: {
    bgClass: "bg-amber-950/40",
    borderClass: "border-amber-500",
    textClass: "text-amber-400",
    title: "INGRESSO JÁ UTILIZADO",
    icon: AlertTriangle,
  },
  INVALID: {
    bgClass: "bg-rose-950/40",
    borderClass: "border-rose-500",
    textClass: "text-rose-400",
    title: "CÓDIGO INVÁLIDO",
    icon: XCircle,
  },
  WRONG_EVENT: {
    bgClass: "bg-purple-950/40",
    borderClass: "border-purple-500",
    textClass: "text-purple-300",
    title: "EVENTO INCORRETO",
    icon: ShieldAlert,
  },
};

export default function GatekeeperValidatePage() {
  const router = useRouter();
  const user = useGatekeeperUser();

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [lastValidation, setLastValidation] = useState<GateValidationResult | null>(null);

  useEffect(() => {
    if (!user || user.role !== "GATEKEEPER") {
      router.replace("/login");
    }
  }, [user, router]);

  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const validateMutation = useMutation({
    mutationFn: (code: string) => {
      if (!selectedEventId) {
        throw new Error("Selecione o evento na portaria antes de validar o ingresso.");
      }
      return validateTicketEntry({
        code: code.trim(),
        eventId: selectedEventId,
      });
    },
    onSuccess: (result) => {
      setLastValidation(result);
      if (result.validationStatus === "VALID") {
        toast.success("Entrada Liberada!", {
          description: `Código ${result.code.slice(0, 8)}... validado com sucesso.`,
        });
      } else {
        toast.warning(`Validação: ${result.validationStatus}`, {
          description: result.message,
        });
      }
    },
    onError: (err) => {
      toast.error("Erro na validação da portaria", {
        description: getApiErrorMessage(err),
      });
    },
  });

  if (!user || user.role !== "GATEKEEPER") {
    return (
      <Container size="md" className="py-20 text-center space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">Acesso Restrito à Portaria</h2>
        <p className="text-sm text-muted-foreground">
          Esta área é exclusiva para operadores autorizados da Portaria (GATEKEEPER).
        </p>
        <Button onClick={() => router.replace("/login")}>
          Ir para Login
        </Button>
      </Container>
    );
  }

  const eventOptions: SelectOption[] = events.map((ev) => ({
    label: `${ev.title} (${ev.location})`,
    value: ev.id,
  }));

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Informe o código do ingresso");
      return;
    }
    validateMutation.mutate(manualCode);
  };

  const handleScanCode = (scannedCode: string) => {
    if (validateMutation.isPending) return;
    setManualCode(scannedCode);
    validateMutation.mutate(scannedCode);
  };

  return (
    <Container size="lg" className="py-8 space-y-8 max-w-3xl">
      <PageHeader
        title="Portaria - Validação de Ingressos"
        description="Escaneie o QR Code ou digite o código manual do bilhete para controle de entrada em tempo real."
      />

      {/* Seleção do Evento na Portaria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TicketIcon className="size-4 text-primary" />
            Selecione o Evento em Operação
          </CardTitle>
          <CardDescription>
            Escolha em qual evento você está realizando a validação de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size="sm" />
              Carregando lista de eventos...
            </div>
          ) : (
            <FormSelect
              options={eventOptions}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              placeholder="-- Selecione o Evento --"
              required
            />
          )}
        </CardContent>
      </Card>

      {/* Resultado da Validação Estilizado (4 Status) */}
      {lastValidation && (() => {
        const config = statusStyles[lastValidation.validationStatus];
        const StatusIcon = config.icon;

        return (
          <div
            className={`p-6 rounded-2xl border-2 transition-all shadow-lg animate-in fade-in-50 duration-300 ${config.bgClass} ${config.borderClass}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full border bg-card/60 ${config.borderClass} ${config.textClass}`}>
                <StatusIcon className="size-8" />
              </div>

              <div className="space-y-1">
                <h3 className={`text-xl font-extrabold tracking-wide ${config.textClass}`}>
                  {config.title}
                </h3>
                <p className="text-sm font-medium text-foreground">
                  {lastValidation.message}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Código: {lastValidation.code}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Scanner por Câmera e Entrada Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leitor de Câmera */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scan className="size-4 text-primary" />
              Câmera QR Code
            </CardTitle>
            <CardDescription>
              Aponte o bilhete do cliente para o leitor de vídeo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QrScanner
              onScanSuccess={handleScanCode}
              disabled={!selectedEventId || validateMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Digitação Manual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              Validação Manual
            </CardTitle>
            <CardDescription>
              Digite o código UUID do ingresso caso o QR Code esteja ilegível.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleManualSubmit}>
            <CardContent className="space-y-4">
              <FormInput
                label="Código do Ingresso"
                placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                leftIcon={<TicketIcon className="size-4" />}
                required
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={!selectedEventId || validateMutation.isPending}
                className="w-full gap-2 font-semibold"
              >
                {validateMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Validando...
                  </>
                ) : (
                  "Validar Entrada"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Container>
  );
}
