import Link from "next/link";
import { Ticket } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className='border-t border-white/10 bg-[oklch(0.15_0.03_264)] py-6'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 text-center'>
        <Link
          href='/'
          className='flex items-center gap-2'
          aria-label='MeuIngresso — início'
        >
          <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Ticket className='h-4 w-4' aria-hidden='true' />
          </span>
          <span className='font-display text-base font-extrabold tracking-tight'>
            Meu<span className='text-primary'>Ingresso</span>
          </span>
        </Link>

        <p className='text-xs text-muted-foreground'>
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
