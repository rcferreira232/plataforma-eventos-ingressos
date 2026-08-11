"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/services/api";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setSubmitError(null);
    try {
      await login(values);
    } catch (error) {
      setSubmitError(await getApiErrorMessage(error));
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16'>
      <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40'>
        <div className='mb-8'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-400'>
            MeuIngresso
          </p>
          <h1 className='mt-2 text-3xl font-semibold text-white'>
            Entrar na plataforma
          </h1>
          <p className='mt-2 text-sm text-slate-400'>
            Acesse sua conta para gerenciar eventos ou comprar ingressos.
          </p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className='mb-2 block text-sm font-medium text-slate-200'
              htmlFor='email'
            >
              E-mail
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-sky-500'
              {...register("email")}
            />
            {errors.email ? (
              <p className='mt-1 text-sm text-rose-400'>
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className='mb-2 block text-sm font-medium text-slate-200'
              htmlFor='password'
            >
              Senha
            </label>
            <input
              id='password'
              type='password'
              autoComplete='current-password'
              className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-sky-500'
              {...register("password")}
            />
            {errors.password ? (
              <p className='mt-1 text-sm text-rose-400'>
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className='rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300'>
              {submitError}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-400'>
          Ainda não tem conta?{" "}
          <Link
            href='/register'
            className='font-semibold text-sky-400 transition hover:text-sky-300'
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
