export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Lumina</span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Portal Lumina</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">
          Estrutura inicial Next.js criada para deploy via Coolify, com integração preparada para Supabase.
        </p>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Ambiente inicial funcionando. Próximo passo: autenticação, layout base e conexão com banco.
        </div>
      </section>
    </main>
  );
}
