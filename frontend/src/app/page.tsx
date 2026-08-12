import Link from "next/link";
import { Ticket, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <main className='flex-1'>
        <section className='relative overflow-hidden border-b border-border py-20 lg:py-32 bg-linear-to-b from-card/80 via-background to-background'>
          <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none' />

          <Container size='xl' className='relative z-10 text-center space-y-8'>
            <div className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm'>
              <Sparkles className='size-3.5 text-amber-400' />
              <span>Plataforma Completa de Gestão & Emissão de Ingressos</span>
            </div>

            <h1 className='text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-foreground'>
              Eventos Inesquecíveis.{" "}
              <span className='bg-linear-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
                Reservas em Tempo Real.
              </span>
            </h1>

            <p className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Sistema moderno para organizadores, clientes e operadores de
              portaria. Garantia de integridade com controle de concorrência
              atômico e bilhetes assinados via HMAC.
            </p>

            <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-4'>
              <Link href='/client/events'>
                <Button
                  size='lg'
                  className='w-full sm:w-auto gap-2 font-bold px-8 h-12 text-base shadow-lg shadow-primary/25'
                >
                  <Ticket className='size-5' />
                  Explorar Catálogo de Eventos
                  <ArrowRight className='size-4' />
                </Button>
              </Link>

              <Link href='/organizer/dashboard'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto gap-2 font-semibold h-12 text-base'
                >
                  Painel do Organizador
                </Button>
              </Link>

              <Link href='/gate/validate'>
                <Button
                  size='lg'
                  variant='ghost'
                  className='w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground h-12 text-base'
                >
                  <ShieldCheck className='size-5 text-indigo-400' />
                  Portaria
                </Button>
              </Link>
            </div>
          </Container>
        </section>
        <section className='py-20'>
          <Container size='lg'>
            <div className='relative overflow-hidden rounded-3xl border border-border bg-linear-to-r from-card via-card/80 to-primary/10 p-8 sm:p-12 text-center space-y-6 shadow-2xl'>
              <h2 className='text-3xl font-black text-foreground'>
                Pronto para experimentar a plataforma?
              </h2>
              <p className='text-sm text-muted-foreground max-w-xl mx-auto'>
                Explore o catálogo completo de eventos, simule uma reserva de
                assento ou acesse o painel do organizador.
              </p>
              <div className='pt-2'>
                <Link href='/client/events'>
                  <Button size='lg' className='font-bold px-8 gap-2'>
                    <Ticket className='size-5' />
                    Acessar Catálogo Agora
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
