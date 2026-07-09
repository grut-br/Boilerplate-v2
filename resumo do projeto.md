# Resumo Geral do Projeto — Devio Master Boilerplate

Este documento consolida tudo o que foi planejado, desenvolvido e otimizado para o **devio-master-boilerplate**, o template mestre e a fundação técnica que a agência utilizará para gerar todos os futuros sites institucionais e sistemas SaaS.

---

## 🚀 O que é o Devio Master Boilerplate?

É uma base modular inspirada em Clean Architecture e organizada com Feature-Sliced Design (FSD), projetada com herança de layout estrita por grupos de rotas (DRY), otimização para sitemaps e robots.txt (SEO), integração com diretrizes de acessibilidade universais (A11y) e suporte integrado ao Supabase para banco de dados e autenticação via cookies de sessão (SSR).

---

## 🛠 Stack Tecnológica Base

* **Framework:** Next.js 16.2 (App Router & Turbopack)
* **Biblioteca:** React 19
* **Estilização:** Tailwind CSS v4 (com variáveis locais de fonte/tema no CSS global)
* **Animações:** Framer Motion (para transições dinâmicas e interações fluidas)
* **Ícones:** Lucide React
* **Validação:** Zod (para validação de dados em runtime no cliente e servidor)
* **Backend & Auth:** Supabase via `@supabase/ssr` e `@supabase/supabase-js`

---

## 📂 Arquitetura de Pastas Implementada

* **`src/app/`** — Rotas do App Router organizadas por grupos lógicos:
  * **`(marketing)/`** — Páginas públicas e institucionais que compartilham do layout padrão (com Header e Footer).
  * **`(auth)/`** — Fluxos de acesso e validação (login, cadastro) em tela cheia.
  * **`(app)/`** — Páginas do painel de administração e sistema SaaS (com Sidebar e Topbar), protegidas pelo middleware.
  * **`sitemap.ts` / `robots.ts`** — APIs de SEO nativas do Next.js para indexação dinâmica.
* **`src/features/`** — Lógica de negócios modularizada e isolada baseada em FSD (ex: `auth`).
  * `auth/components/` — Componentes específicos da feature (ex: `login-form.tsx`).
  * `auth/schemas.ts` — Validação de schemas Zod.
  * `auth/actions.ts` — Server Actions da feature para execução direta no servidor.
* **`src/components/`** — Blocos de interface compartilhados:
  * `layout/` — `header.tsx` e `footer.tsx` (marketing), além de `Sidebar.tsx` e `Topbar.tsx` (SaaS).
  * `forms/` — Elementos de formulários atômicos e acessíveis (`BaseInput.tsx`).
  * `ui/` — Componentes atômicos e reutilizáveis de interface de usuário.
  * `sections/` — Seções completas e autocontidas de páginas institucionais.
* **`src/config/`** — Central de comandos e parametrização:
  * `site.ts` — Metadados gerais do site (`siteConfig`).
  * `navigation.ts` — Rotas de links do menu institucional e do painel SaaS.
  * `permissions.ts` — Mapeamento de papéis lógicos de usuários (`ROLES`).
* **`src/lib/`** — Serviços e configurações de infraestrutura comuns.
  * **`supabase/`** — Configurações SSR de cliente (`client.ts`), servidor (`server.ts`) e manipulação de sessão em cookies no middleware (`middleware.ts`).
* **`.agents/skills/`** — Diretório com diretrizes de design, cores e comportamento para agentes de IA.

---

## 🤖 Infraestrutura de IA

Para otimizar o trabalho de agentes autônomos de IA e desenvolvedores integrados, o boilerplate conta com uma infraestrutura dedicada de ferramentas e diretrizes locais:

### ⚡ Servidores MCP Integrados
O ambiente de desenvolvimento do agente possui acesso direto a servidores MCP locais para automação de tarefas:
* **`chrome-devtools-mcp`**: Controle remoto do Google Chrome para renderizar páginas, capturar imagens de validação e auditar acessibilidade e performance.
* **`github`**: Integração com a API do GitHub para criar branches, commits, criar Pull Requests e consultar arquivos no repositório.
* **`vercel`**: Deploy automatizado de staging/produção, monitoramento e leitura de logs e erros de execução em tempo real.

### 🧠 Diretório de Skills Portáveis (`.agents/skills/`)
As principais diretrizes de desenvolvimento da agência estão salvas localmente na pasta `.agents/skills/`:
* **UI/UX & Design**: [ui-ux-pro-max](./.agents/skills/ui-ux-pro-max/SKILL.md), [design-system](./.agents/skills/design-system/SKILL.md), [frontend-design](./.agents/skills/frontend-design/SKILL.md), [theme-factory](./.agents/skills/theme-factory/SKILL.md) e [brand](./.agents/skills/brand/SKILL.md).
* **Desenvolvimento & Acessibilidade**: [a11y-micro-acessibilidade](./.agents/skills/a11y-micro-acessibilidade/SKILL.md), [core-web-vitals](./.agents/skills/core-web-vitals/SKILL.md), [vercel-react-best-practices](./.agents/skills/vercel-react-best-practices/SKILL.md) e [backend-supabase-mastery](./.agents/skills/backend-supabase-mastery/SKILL.md).
* **Escrita & Validação**: [ux-writing](./.agents/skills/ux-writing/SKILL.md) e [webapp-testing](./.agents/skills/webapp-testing/SKILL.md).

---

## 📝 O que foi desenvolvido (Passo a Passo)

### 1. Inicialização e Instalação
* Criação do projeto em Next.js com TypeScript e Tailwind v4.
* Instalação silenciosa de `framer-motion`, `lucide-react`, `zod` e `@supabase/supabase-js`.

### 2. Configuração do Layout e Herança Global (DRY)
* **[layout.tsx](./src/app/layout.tsx)**: RootLayout que carrega apenas as tags estruturais do HTML (`<html>`, `<body>`), os provedores essenciais e o arquivo de estilização global `globals.css`, delegando as injeções visuais de cabeçalhos e menus para os Route Groups.

### 3. Componentes de Layout e Landing Page
* **[header.tsx](./src/components/layout/header.tsx)**: Header responsivo moderno contendo animações de entrada e menu hambúrguer via `framer-motion`.
* **[footer.tsx](./src/components/layout/footer.tsx)**: Footer dividido em colunas (Branding, Links, Contato) com redes sociais em SVGs inline nativos.

### 4. Modernização Arquitetural e Modularização (FSD & Route Groups)
* **Route Groups**: Criação de `(marketing)` para o site institucional e `(app)` para o sistema SaaS.
  * O layout de `(marketing)` abraça o `Header` e `Footer`.
  * O layout de `(app)` abraça o painel administrativo através dos componentes criados de [Sidebar](./src/components/layout/Sidebar.tsx) e [Topbar](./src/components/layout/Topbar.tsx) sob uma estrutura clássica em colunas `flex h-screen overflow-hidden`.
* **Feature-Sliced Design (FSD)**: Estruturação de funcionalidades complexas dentro de `src/features/`. Implementação da feature base [auth](./src/features/auth/) contendo formulário de login integrado via Server Actions ([actions.ts](./src/features/auth/actions.ts)) e validação robusta em runtime e compilação com Zod ([schemas.ts](./src/features/auth/schemas.ts)).
* **Configurações Centralizadas**: Criação de [site.ts](./src/config/site.ts) concentrando o objeto `siteConfig` com metadados do projeto como única fonte da verdade de parametrizações institucionais.
* **Limpeza e Otimização do ESLint**: Atualização das configurações de linter no [eslint.config.mjs](./eslint.config.mjs) para ignorar o diretório de skills portáveis `.agents/**`.

### 5. Refinamento Avançado (Supabase SSR, Proteção e SEO)
* **Supabase SSR**: Instalação de `@supabase/ssr` e criação de [client.ts](./src/lib/supabase/client.ts) (browser), [server.ts](./src/lib/supabase/server.ts) (server-side com cookies) e [middleware.ts](./src/lib/supabase/middleware.ts) (gerenciamento e expiração de sessão em cookies no middleware).
* **Proteção de Rotas**: Implementação do arquivo principal de [middleware.ts](./src/middleware.ts) na raiz do código fonte interceptando rotas privadas. Por padrão ele protege `/dashboard`, mas novas rotas privadas como `/settings`, `/profile`, `/billing`, `/users` e `/admin` devem ser adicionadas ao matcher ou seguir a convenção de rotas protegidas de forma explícita.
* **Isolamento de Rota de Acesso**: Criação do Route Group `(auth)` e da página de acesso [login/page.tsx](./src/app/(auth)/login/page.tsx) abrigando o `LoginForm`.
* **Fundação de Formulários (UI/A11y)**: Desenvolvimento do input genérico e acessível [BaseInput.tsx](./src/components/forms/BaseInput.tsx) com suporte a referências do React.
* **APIs de SEO Técnico**: Configuração das APIs dinâmicas nativas de sitemap ([sitemap.ts](./src/app/sitemap.ts)) e robots ([robots.ts](./src/app/robots.ts)).
* **Centrais de Navegação e Permissões**: Criação de [navigation.ts](./src/config/navigation.ts) e [permissions.ts](./src/config/permissions.ts).

## ⚙️ Recursos Opcionais por Projeto

Esta fundação técnica foi mantida o mais genérica e limpa possível. Os recursos listados abaixo são considerados opcionais e devem ser configurados ou implementados apenas quando o escopo do projeto final exigir:
* **CI/CD Pipelines**: Integração de workflows (ex: GitHub Actions) para deploy, validação e pipelines automatizados.
* **Performance Budget**: Limites de bundle, métricas Web Vitals rígidas e auditorias integradas via CI.
* **Testes Automatizados**: Suítes de testes unitários (Vitest/Jest) ou de ponta a ponta (Playwright).
* **Supabase Admin**: Configurações de acesso direto com privilégios administrativos (Service Role) sob demanda no servidor.
* **Integrações de Terceiros**: Gateways de pagamento, serviços de e-mail transacional e CRMs externos.

---

## 📈 Resultado da Validação do Build

O build de produção do Next.js foi validado e compilado com absoluto sucesso usando o compilador Next.js (Turbopack) e TypeScript:

```bash
▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 12.0s
  Running TypeScript ...
  Finished TypeScript in 8.8s ...
  Collecting page data using 9 workers ...
  Generating static pages using 9 workers (0/8) ...
✓ Generating static pages using 9 workers (8/8) in 2.6s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /login
├ ○ /robots.txt
└ ○ /sitemap.xml
```
