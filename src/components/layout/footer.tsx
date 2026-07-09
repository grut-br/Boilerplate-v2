import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

// Ícones oficiais que foram descontinuados no Lucide v1.x para evitar conflitos de marcas
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const linksUteis = [
    { label: "Serviços", href: "#servicos" },
    { label: "Sobre Nós", href: "#sobre" },
    { label: "Cases de Sucesso", href: "#cases" },
    { label: "Contato", href: "#contato" },
  ];

  const contatos = [
    { icon: Phone, label: "+55 (11) 99999-9999", href: "tel:+5511999999999" },
    { icon: Mail, label: "contato@suaagencia.com.br", href: "mailto:contato@suaagencia.com.br" },
    { icon: MapPin, label: "São Paulo, SP - Brasil", href: "#" },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-black text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16">
          
          {/* Logo & Sobre */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors">
                Devio<span className="text-violet-500">.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-zinc-500">
              Criando soluções digitais sob medida para escalar o seu negócio e garantir a melhor experiência de usuário do mercado.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <GithubIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Navegação</h3>
            <ul className="space-y-2 text-sm">
              {linksUteis.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contato</h3>
            <ul className="space-y-3 text-sm">
              {contatos.map((contato, idx) => {
                const Icon = contato.icon;
                return (
                  <li key={idx} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-violet-500 shrink-0" />
                    {contato.href !== "#" ? (
                      <Link href={contato.href} className="hover:text-white transition-colors">
                        {contato.label}
                      </Link>
                    ) : (
                      <span>{contato.label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Divisão inferior do Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {currentYear} Devio. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Desenvolvido por</span>
            <Link
              href="https://suaagencia.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:text-violet-400 transition-colors"
            >
              [Nome da Agência]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
