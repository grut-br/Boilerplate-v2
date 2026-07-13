# Devio Master Boilerplate — Fundação de Alto Padrão

O **Devio Master Boilerplate** é o template mestre da agência para a criação de sites e painéis SaaS modernos. Ele foi desenvolvido com o foco em desempenho de elite, portabilidade e herança estrita de layout.

> [!IMPORTANT]
> **Nota de Alinhamento Arquitetural (Sprint V3.1-01A):**
> A arquitetura de monorepo experimental da Sprint V3.1-01 foi reclassificada como **Proof of Concept (PoC)** e completamente removida do Boilerplate para evitar acoplamento físico prematuro.
> A Framework Engine V3.1 física será desenvolvida em um **repositório independente**. O Boilerplate permanece unicamente como um **consumidor independente** da Engine, orientando suas execuções através dos metadados e regras lógicas descritas na camada cognitiva local (`.agents/` e `.ai-workspace/`).

---

## 🏗️ Arquitetura

O projeto adota uma **base modular inspirada em Clean Architecture e organizada com Feature-Sliced Design (FSD)**. Isso nos permite isolar a infraestrutura técnica e componentes atômicos (como o Supabase e inputs globais) das regras de negócios específicas (localizadas dentro da pasta `src/features/`).

---

## 🚀 Modos de Uso

Este Boilerplate Mestre está preparado para atender a três cenários de implantação principais:

### 1. Landing Pages (Marketing Rápido)
* **Onde desenvolver:** `src/app/(marketing)/`
* **Características:** Rota raiz `/` altamente otimizada, herança automática de componentes estruturais de cabeçalho e rodapé, suporte a animações físicas aceleradas por hardware via Framer Motion e zero dependências de fontes externas para permitir builds rápidos de CI/CD.

### 2. Sites Institucionais (Conteúdo & Presença Digital)
* **Onde desenvolver:** `src/app/(marketing)/`
* **Características:** Configurações de SEO técnico nativas usando os arquivos de metadados de sitemap e robôs do Next.js (que consultam de forma unificada as propriedades do `siteConfig` em `src/config/site.ts`).

### 3. SaaS / Dashboards Internos (Sistemas Web)
* **Onde desenvolver:** `src/app/(app)/` e rotas de acesso em `src/app/(auth)/`
* **Características:** Painel administrativo responsivo utilizando o App Shell (`Sidebar` lateral fixa + `Topbar` superior). As rotas privadas (como `/dashboard` por padrão, com suporte a extensões como `/settings`, `/profile`, `/billing`, `/users` e `/admin`) são protegidas por sessão ativa via **Supabase SSR** no middleware (`src/middleware.ts`), redirecionando usuários não autenticados de volta à tela de login.

## ⚙️ Recursos Opcionais por Projeto

A base do boilerplate foi mantida limpa e agnóstica. Recursos adicionais devem ser adicionados apenas sob demanda de cada projeto:
* **Pipelines de CI/CD**: Automação de deploy e testes integrados via GitHub Actions ou Vercel.
* **Performance Budget**: Limitações de peso de bundle e métricas de Web Vitals rígidas no pipeline.
* **Suíte de Testes**: Testes unitários com Vitest/Jest e testes ponta a ponta (E2E) com Playwright.
* **Supabase Admin**: Configurações adicionais com Service Role para manipulação privilegiada no servidor.
* **Integrações de API**: Sistemas externos como CRMs, gateways de pagamento e serviços de e-mail.

---

## ⚡ Começando

### Pré-requisitos
Certifique-se de configurar as variáveis de ambiente necessárias em seu arquivo `.env` com base no [.env.example](./.env.example):
```bash
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

### Servidor de Desenvolvimento
Inicie o servidor localmente:
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

---

## 📝 Scripts de Validação

* **Análise estática (Lint):** `npm run lint`
* **Compilação de produção (Build):** `npm run build`
