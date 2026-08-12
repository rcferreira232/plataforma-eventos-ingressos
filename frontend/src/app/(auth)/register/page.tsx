"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ticket, Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/services/api";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect, SelectOption } from "@/components/ui/form-select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ORGANIZER", "CUSTOMER", "GATEKEEPER"]).optional(),
});

const roleOptions: SelectOption[] = [
  { label: "Cliente (Comprar Ingressos)", value: "CUSTOMER" },
  { label: "Organizador (Criar Eventos)", value: "ORGANIZER" },
  { label: "Operador de Portaria (GATEKEEPER)", value: "GATEKEEPER" },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setSubmitError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role ?? "CUSTOMER",
      });
      toast.success("Conta criada com sucesso!", {
        description: "Você foi cadastrado e autenticado na plataforma.",
      });
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setSubmitError(msg);
      toast.error("Erro ao criar conta", { description: msg });
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
        {/* Marca & Cabeçalho */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
              <Ticket className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              Meu<span className="text-primary">Ingresso</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Criar nova conta
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastre-se e selecione o perfil desejado para acessar o sistema.
            </p>
          </div>
        </div>

        {/* Exibição de Erro Geral */}
        {submitError && (
          <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Formulário */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Nome Completo"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            leftIcon={<User className="size-4" />}
            error={errors.name?.message}
            {...register("name")}
            required
          />

          <FormInput
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            leftIcon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register("email")}
            required
          />

          <FormInput
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            leftIcon={<Lock className="size-4" />}
            error={errors.password?.message}
            {...register("password")}
            required
          />

          <FormSelect
            label="Perfil de Acesso"
            options={roleOptions}
            error={errors.role?.message}
            {...register("role")}
            required
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold h-11 gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Criar Conta
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
