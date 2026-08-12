"use client";

import Link from "next/link";
import { X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [{ label: "Eventos", href: "/client/events" }];

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
}

export function NavMenu({ open, onClose }: NavMenuProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ORGANIZER":
        return "default";
      case "GATEKEEPER":
        return "warning";
      case "CUSTOMER":
        return "success";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ORGANIZER":
        return "Organizador";
      case "GATEKEEPER":
        return "Portaria";
      case "CUSTOMER":
        return "Cliente";
      default:
        return "Visitante";
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden='true'
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 max-w-[80vw] border-r border-white/10 bg-[oklch(0.19_0.035_264)] p-6 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between border-b border-white/10 pb-4'>
            <Link
              href='/'
              className='flex items-center gap-2'
              onClick={onClose}
            >
              <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <Ticket className='h-4 w-4' aria-hidden='true' />
              </span>
              <span className='font-display text-base font-extrabold tracking-tight'>
                Meu<span className='text-primary'>Ingresso</span>
              </span>
            </Link>

            <button
              type='button'
              onClick={onClose}
              aria-label='Fechar menu'
              className='flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
          <nav className='flex flex-col gap-1' aria-label='Navegação principal'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className='rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground'
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className='flex flex-col gap-2 border-t border-white/10 pt-4'>
          <Button
            nativeButton={false}
            render={<Link href='/login' onClick={onClose} />}
            variant='outline'
            className='w-full border-white/10 bg-transparent'
          >
            Entrar
          </Button>
          <Button
            nativeButton={false}
            render={<Link href='/register' onClick={onClose} />}
            className='w-full font-semibold'
          >
            Criar conta
          </Button>
        </div>
      </aside>
    </>
  );
}
