import { User, Bell, Menu } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 w-full border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between text-white">
      {/* Esquerda: Menu Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Abrir menu"
          className="md:hidden p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-zinc-100 hidden sm:inline-block">
          SaaS Dashboard
        </span>
      </div>

      {/* Direita: Notificações & Perfil */}
      <div className="flex items-center gap-4">
        {/* Notificações */}
        <button
          type="button"
          aria-label="Notificações"
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Separador */}
        <div className="h-5 w-[1px] bg-zinc-800" />

        {/* Perfil Usuário */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-zinc-200">Administrador</p>
            <p className="text-[10px] text-zinc-500">admin@devio.com.br</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <User className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
