interface SharedTicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function SharedTicketPage({
  params,
}: SharedTicketPageProps) {
  const { id } = await params;

  return (
    <main className='min-h-screen bg-slate-950 p-8 text-white'>
      <div className='mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8'>
        <h1 className='text-2xl font-semibold'>Ingresso compartilhado</h1>
        <p className='mt-2 text-slate-400'>Código compartilhado: {id}</p>
      </div>
    </main>
  );
}
