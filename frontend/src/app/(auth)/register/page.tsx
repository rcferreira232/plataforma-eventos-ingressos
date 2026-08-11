"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    <main className='flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16'>
      <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40'>
        <div className='mb-8'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-400'>
            MeuIngresso
          </p>
          <h1 className='mt-2 text-3xl font-semibold text-white'>
            Criar conta
          </h1>
          <p className='mt-2 text-sm text-slate-400'>
            Cadastre-se e comece a usar a plataforma com o perfil desejado.
          </p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className='mb-2 block text-sm font-medium text-slate-200'
              htmlFor='name'
            >
              Nome
            </label>
            <input
              id='name'
              type='text'
              autoComplete='name'
              className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-sky-500'
              {...register("name")}
            />
            {errors.name ? (
              <p className='mt-1 text-sm text-rose-400'>
                {errors.name.message}
              </p>
            ) : null}
          </div>

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
              autoComplete='new-password'
              className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-sky-500'
              {...register("password")}
            />
            {errors.password ? (
              <p className='mt-1 text-sm text-rose-400'>
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className='mb-2 block text-sm font-medium text-slate-200'
              htmlFor='role'
            >
              Perfil
            </label>
            <select
              id='role'
              className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500'
              {...register("role")}
            >
              <option value='CUSTOMER'>Cliente</option>
              <option value='ORGANIZER'>Organizador</option>
              <option value='GATEKEEPER'>Portaria</option>
            </select>
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
            {isSubmitting ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-400'>
          Já tem conta?{" "}
          <Link
            href='/login'
            className='font-semibold text-sky-400 transition hover:text-sky-300'
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
