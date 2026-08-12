"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/services/api";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ORGANIZER", "CUSTOMER", "GATEKEEPER"]).optional(),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
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
    } catch (error) {
      setSubmitError(await getApiErrorMessage(error));
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground'>
      <div className='w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl'>
        {/* Header com a Marca no padrão do NavMenu e LoginPage */}
        <div className='mb-8 flex flex-col items-start gap-4'>
          <Link href='/' className='flex items-center gap-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Ticket className='h-4 w-4' aria-hidden='true' />
            </span>
            <span className='font-display text-base font-extrabold tracking-tight'>
              Meu<span className='text-primary'>Ingresso</span>
            </span>
          </Link>

          <div>
            <h1 className='text-2xl font-bold tracking-tight text-card-foreground'>
              Criar conta
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Cadastre-se e comece a usar a plataforma com o perfil desejado.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className='mb-1.5 block text-sm font-medium text-foreground'
              htmlFor='name'
            >
              Nome
            </label>
            <input
              id='name'
              type='text'
              autoComplete='name'
              placeholder='Seu nome completo'
              className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring'
              {...register("name")}
            />
            {errors.name ? (
              <p className='mt-1 text-xs text-destructive'>
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className='mb-1.5 block text-sm font-medium text-foreground'
              htmlFor='email'
            >
              E-mail
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              placeholder='seu@email.com'
              className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring'
              {...register("email")}
            />
            {errors.email ? (
              <p className='mt-1 text-xs text-destructive'>
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className='mb-1.5 block text-sm font-medium text-foreground'
              htmlFor='password'
            >
              Senha
            </label>
            <input
              id='password'
              type='password'
              autoComplete='new-password'
              placeholder='••••••••'
              className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring'
              {...register("password")}
            />
            {errors.password ? (
              <p className='mt-1 text-xs text-destructive'>
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className='mb-1.5 block text-sm font-medium text-foreground'
              htmlFor='role'
            >
              Perfil
            </label>
            <select
              id='role'
              className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring'
              {...register("role")}
            >
              <option value='CUSTOMER' className='bg-card text-foreground'>
                Cliente
              </option>
              <option value='ORGANIZER' className='bg-card text-foreground'>
                Organizador
              </option>
              <option value='GATEKEEPER' className='bg-card text-foreground'>
                Portaria
              </option>
            </select>
          </div>

          {submitError ? (
            <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              {submitError}
            </p>
          ) : null}

          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full font-semibold'
          >
            {isSubmitting ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>

        <p className='mt-6 text-center text-sm text-muted-foreground'>
          Já tem conta?{" "}
          <Link
            href='/login'
            className='font-medium text-primary transition hover:underline'
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
