"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavMenu } from "./nav-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-white/10 bg-[oklch(0.19_0.035_264)]/85 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8'>
          <button
            type='button'
            aria-expanded={open}
            aria-label='Abrir menu'
            onClick={() => setOpen(true)}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground'
          >
            <Menu className='h-4 w-4' />
          </button>
          <Link
            href='/'
            className='flex items-center gap-2'
            aria-label='MeuIngresso — início'
          >
            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Ticket className='h-5 w-5' aria-hidden='true' />
            </span>
            <span className='font-display text-lg font-extrabold tracking-tight'>
              Meu<span className='text-primary'>Ingresso</span>
            </span>
          </Link>
          <div className='ml-auto flex items-center gap-2'>
            <button
              type='button'
              aria-label='Buscar'
              className='flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground'
            >
              <Search className='h-4 w-4' aria-hidden='true' />
            </button>

            <Button
              nativeButton={false}
              render={<Link href='/login' />}
              variant='ghost'
              className='hidden h-9 px-4 text-muted-foreground hover:text-foreground sm:inline-flex'
            >
              Entrar
            </Button>
            <Button
              nativeButton={false}
              render={<Link href='/register' />}
              className='hidden h-9 px-4 font-semibold sm:inline-flex'
            >
              Criar conta
            </Button>
          </div>
        </div>
      </header>
      <NavMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
