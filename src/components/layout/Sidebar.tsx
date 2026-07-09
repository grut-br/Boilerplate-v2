import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, Terminal, Users, BarChart } from "lucide-react";

export function Sidebar() {
  const menuItens = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Usuários", href: "#usuarios", icon: Users },
    { label: "Relatórios", href: "#relatorios", icon: BarChart },
    { label: "Configurações", href: "#configuracoes", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-zinc-900 border-r border-zinc-800 text-zinc-300">
      {/* Brand logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-zinc-800">
        <Terminal className="h-6 w-6 text-violet-500" />
        <span className="font-bold text-white tracking-wider text-sm">DEVIO CONSOLE</span>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItens.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Icon className="h-4 w-4 text-zinc-400" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sair */}
      <div className="p-4 border-t border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut className="h-4 w-4" />
          Voltar para Home
        </Link>
      </div>
    </aside>
  );
}
