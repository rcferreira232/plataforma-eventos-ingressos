export default function GateValidatePage() {
  return (
    <main className='min-h-screen bg-background p-8 text-foreground'>
      <div className='mx-auto max-w-5xl'>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>
          Validação de ingressos
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Próxima etapa: integrar leitura de QR Code e validação via backend.
        </p>
      </div>
    </main>
  );
}
