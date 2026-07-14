# Cenários de Projetos — PROJECT TYPES

A **Devio Platform V4** é altamente adaptável. Este guia rápido instrui como modularizar, remover e configurar a estrutura do Boilerplate para atender ao escopo exato do seu projeto comercial.

---

## 1. Landing Page / Site Institucional
* **Foco:** Presença digital, SEO técnico, marketing e alta velocidade de carregamento.
* **O que UTILIZAR:**
  * Desenvolva tudo sob o grupo de rotas **`src/app/(marketing)/`**.
  * Use as APIs estáticas dinâmicas de SEO `sitemap.ts` e `robots.ts` na raiz do app.
  * Utilize componentes de layout em `src/components/layout/header.tsx` e `footer.tsx`.
* **O que REMOVER (Limpeza opcional):**
  * Se o projeto for estritamente institucional e não possuir área de login, você pode apagar com segurança as pastas:
    * `src/app/(app)/` (dashboard e painel SaaS).
    * `src/app/(auth)/` (telas de login).
    * `src/features/auth/` (regras e formulários de autenticação).
    * Remover referências a cookies do Supabase no middleware.

---

## 2. Dashboard / SaaS / ERP (Sistemas Web)
* **Foco:** Painéis interativos protegidos, controle de sessão, gestão de permissões e processamento de dados.
* **O que UTILIZAR:**
  * Desenvolva tudo sob o grupo de rotas **`src/app/(app)/`** (SaaS) e **`src/app/(auth)/`** (Login).
  * Configure o middleware de segurança `src/middleware.ts` e o arquivo `src/config/permissions.ts`.
  * Modularize as features de negócio (ex: perfis, faturas, gerenciamento de usuários) em `src/features/[feature]/`.
* **O que REMOVER (Limpeza opcional):**
  * Se o sistema corporativo ou SaaS possuir uma página pública separada (ex: hospedada em um site institucional à parte), você pode remover as rotas de marketing da aplicação:
    * Apague `src/app/(marketing)/` e seus componentes associados.
    * Redirecione a rota raiz `/` no Next.js diretamente para `/login` ou `/dashboard`.

---

## 3. APIs / Microsserviços / Backend Puro
* **Foco:** Endpoints RESTful, webhooks de integração, validações estritas no servidor e zero interface visual.
* **O que UTILIZAR:**
  * Crie seus handlers em **`src/app/api/`** utilizando Route Handlers do Next.js.
  * Use os mappers de cookies do Supabase Server Client em `src/lib/supabase/server.ts` para verificar credenciais e autenticação baseada em tokens.
  * Utilize schemas Zod para validar os payloads das requisições POST/PUT.
* **O que REMOVER (Limpeza recomendada):**
  * Remova toda a interface visual (HTML/CSS) do front-end:
    * Apague as pastas `src/app/(marketing)/`, `src/app/(app)/`, `src/app/(auth)/` e `src/components/`.
    * No `src/app/layout.tsx`, mantenha apenas a injeção básica e exporte respostas JSON em Route Handlers.
    * Você pode deletar dependências visuais como `framer-motion` no package.json.

---

## 4. Integrações Rápidas de IA / Engenharia de Prompt (Framework Engine)
* **Foco:** Executar buscas no workspace do código e montar prompts otimizados em pipelines locais.
* **O que UTILIZAR:**
  * O código da Engine reside isolado em **`framework-engine/`**.
  * Use a CLI do framework para validar o estado e diagnosticar problemas de dependências.
* **O que REMOVER:**
  * A Engine opera de forma totalmente desacoplada e isolada do Next.js. Se o projeto de destino do cliente for um site simples e não necessitar de ferramentas de IA ou MCP locais em produção, a pasta `framework-engine/` não é empacotada no build do Next.js. Ela serve estritamente como ferramenta de desenvolvimento em tempo de codificação.
