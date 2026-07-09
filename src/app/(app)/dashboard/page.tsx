import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Sistema",
  description: "Dashboard do Sistema SaaS.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Dashboard do Sistema
        </h1>
        <p className="text-zinc-400">
          Bem-vindo à área de administração. Aqui você poderá gerenciar as configurações do seu SaaS.
        </p>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-zinc-400">Usuários Ativos</h2>
          <p className="mt-2 text-3xl font-semibold text-white">1.248</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-zinc-400">Receita Mensal</h2>
          <p className="mt-2 text-3xl font-semibold text-white">R$ 14.250</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-zinc-400">Projetos Ativos</h2>
          <p className="mt-2 text-3xl font-semibold text-white">32</p>
        </div>
      </div>

      {/* Grid Informativo Secundário */}
      <div className="border-t border-zinc-800 pt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Visão Geral da Conta</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Seu ambiente está integrado e as conexões estão seguras.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6">
            <h3 className="text-base font-semibold text-white">Banco de Dados Supabase</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Integração ativa via `@supabase/ssr`. As requisições são validadas de forma assíncrona no Middleware com suporte a cookies.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6">
            <h3 className="text-base font-semibold text-white">Políticas de Segurança (RLS)</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Acesso a tabelas restrito via Row Level Security (RLS). A validação dos dados de entrada é centralizada em schemas Zod.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
