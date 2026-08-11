import Link from "next/link";

export default function Home() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)] px-6 py-16'>
      <section className='w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-12'>
        <p className='mb-4 inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-300'>
          MeuIngresso • Plataforma de eventos e ingressos
        </p>
        <h1 className='text-4xl font-semibold tracking-tight text-white sm:text-5xl'>
          Venda, reserve e valide ingressos com uma experiência moderna.
        </h1>
        <p className='mt-4 max-w-2xl text-lg text-slate-300'>
          Organizadores criam eventos, clientes reservam ingressos e a portaria
          valida entradas com QR Code em um fluxo integrado.
        </p>
        <div className='mt-8 flex flex-wrap gap-4'>
          <Link
            href='/login'
            className='rounded-full bg-sky-500 px-5 py-3 font-medium text-white transition hover:bg-sky-400'
          >
            Entrar
          </Link>
          <Link
            href='/register'
            className='rounded-full border border-slate-700 px-5 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800'
          >
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}
