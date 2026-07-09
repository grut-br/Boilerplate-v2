export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

export const marketingNav: NavItem[] = [
  { title: "Início", href: "/" },
  { title: "Serviços", href: "/#servicos" },
  { title: "Sobre Nós", href: "/#sobre" },
  { title: "Contato", href: "/#contato" },
];

export const dashboardNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Usuários", href: "#usuarios" },
  { title: "Relatórios", href: "#relatorios" },
  { title: "Configurações", href: "#configuracoes" },
];
