"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Ticket, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { NavMenu } from "./nav-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8'>
          <button
            type='button'
            aria-expanded={open}
            aria-label='Abrir menu'
            onClick={() => setOpen(true)}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-accent'
          >
            <Menu className='h-4 w-4' />
          </button>

          <Link
            href='/'
            className='flex items-center gap-2'
            aria-label='MeuIngresso — início'
          >
            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md'>
              <Ticket className='h-5 w-5' aria-hidden='true' />
            </span>
            <span className='font-display text-lg font-extrabold tracking-tight text-foreground'>
              Meu<span className='text-primary'>Ingresso</span>
            </span>
          </Link>

          <div className='ml-auto flex items-center gap-3'>
            {user ? (
              <div className='flex items-center gap-3'>
                <div className='hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60'>
                  <UserIcon className='size-3.5 text-primary' />
                  <span className='text-xs font-semibold text-foreground truncate max-w-30'>
                    {user.name}
                  </span>
                  <Badge
                    variant='secondary'
                    className='text-[10px] uppercase py-0 px-1.5'
                  >
                    {user.role}
                  </Badge>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={logout}
                  className='gap-1.5 text-xs text-muted-foreground hover:text-destructive'
                >
                  <LogOut className='size-3.5' />
                  <span className='hidden sm:inline'>Sair</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href='/login'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='hidden h-9 px-4 text-muted-foreground hover:text-foreground sm:inline-flex'
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href='/register'>
                  <Button
                    size='sm'
                    className='hidden h-9 px-4 font-semibold sm:inline-flex'
                  >
                    Criar conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <NavMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
