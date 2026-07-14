# Guia de Início Rápido — START HERE

Bem-vindo à **Devio Platform V4**! Este manual foi projetado para responder diretamente à pergunta: **"Em qual situação de projeto estou?"** e direcionar você para o caminho correto.

---

## 🛠️ Instalação e Configuração Geral

Antes de escolher o seu cenário, prepare o ambiente de desenvolvimento local:

1. **Clonar e Acessar o Projeto:**
   ```bash
   git clone <repositorio>
   cd Boilerplate-v2
   ```
2. **Instalar Dependências (usando o pnpm configurado):**
   ```bash
   pnpm install
   ```
3. **Variáveis de Ambiente:** Copie o arquivo `.env.example` para `.env` e configure as chaves do Supabase:
   ```bash
   cp .env.example .env
   ```
4. **Executar em Desenvolvimento:**
   ```bash
   pnpm run dev
   ```

---

## 🗺️ Escolha a sua Situação de Projeto

### 1. Quero Criar uma Landing Page (Marketing Rápido)
* **Objetivo:** Desenvolver páginas institucionais de alto desempenho, acessíveis, otimizadas para SEO e com micro-animações fluidas.
* **Estrutura:** Desenvolva sob o grupo de rotas **`src/app/(marketing)/`**.
* **Workflow:**
  1. Adicione a rota em `src/app/(marketing)/sua-pagina/page.tsx`.
  2. Crie as seções estruturais em `src/components/sections/`.
  3. Insira as configurações de menu em `src/config/navigation.ts`.
  4. O cabeçalho e o rodapé são injetados automaticamente pelo layout do grupo. **NUNCA** os importe na página.
* **Documentação Relacionada:**
   * [**`PROJECT_TYPES.md`**](./docs/guides/PROJECT_TYPES.md#1-landing-page--site-institucional)
   * [**`.agents/workflows/landing-page.md`**](./.agents/workflows/landing-page.md)

### 2. Quero Criar um SaaS (Sistema Multi-Inquilino)
* **Objetivo:** Construir um painel administrativo seguro, com controle de sessão e gerenciamento de perfil.
* **Estrutura:** Desenvolva sob o grupo de rotas **`src/app/(app)/`** para a área restrita e **`src/app/(auth)/`** para login e cadastros.
* **Workflow:**
  1. Crie a feature correspondente dentro de `src/features/[sua-feature]/` (componentes, schemas Zod e Server Actions).
  2. Associe a nova rota privada no array do `matcher` no arquivo `src/middleware.ts` para proteção contra acessos não autenticados.
  3. Vincule os novos links de navegação na Sidebar dentro de `src/config/navigation.ts`.
* **Documentação Relacionada:**
  * [**`PROJECT_TYPES.md`**](./docs/guides/PROJECT_TYPES.md#2-saas--dashboard-restrito)
   * [**`.agents/workflows/crud.md`**](./.agents/workflows/crud.md)
   * [**`.agents/skills/backend-supabase-mastery/SKILL.md`**](./.agents/skills/backend-supabase-mastery/SKILL.md)

### 3. Quero Criar um ERP (Sistema Corporativo de Gestão)
* **Objetivo:** Desenvolver uma aplicação de gestão densa baseada em dados, tabelas relacionais complexas e controle de permissões.
* **Estrutura:** 
  * Remova a pasta de rotas de marketing `src/app/(marketing)` se o sistema não possuir página pública.
  * Utilize **`src/app/(app)/`** para as telas administrativas.
  * Gerencie papéis em `src/config/permissions.ts` (ex: `ADMIN`, `MANAGER`, `USER`).
* **Workflow:**
  1. Configure o banco de dados no Supabase.
  2. Implemente as features de negócio de forma modular em `src/features/`.
  3. Garanta acessibilidade total de navegação por teclado nas tabelas densas seguindo as regras de A11y.
* **Documentação Relacionada:**
  * [**`PROJECT_TYPES.md`**](./docs/guides/PROJECT_TYPES.md#3-erp--sistema-de-gestão-corporativa)
   * [**`.agents/skills/a11y-micro-acessibilidade/SKILL.md`**](./.agents/skills/a11y-micro-acessibilidade/SKILL.md)

### 4. Quero Criar uma API (Serviços de Integração)
* **Objetivo:** Disponibilizar endpoints e webhooks seguros no Next.js.
* **Estrutura:** Desenvolva sob a pasta **`src/app/api/`**.
* **Workflow:**
  1. Crie arquivos `route.ts` contendo exportações nomeadas das requisições (ex: `export async function POST(req) {}`).
  2. Adicione os caminhos das APIs nas regras de bypass do middleware para que webhooks externos possam acessá-los sem sessão de cookies do Supabase.
  3. Valide as entradas da API usando schemas Zod.
* **Documentação Relacionada:**
   * [**`PROJECT_TYPES.md`**](./docs/guides/PROJECT_TYPES.md#4-api--backend-puro)

### 5. Quero Criar um Dashboard (Visualização de Dados)
* **Objetivo:** Renderizar relatórios, KPIs e gráficos interativos no painel restrito.
* **Estrutura:** Desenvolva sob **`src/app/(app)/dashboard/`**.
* **Workflow:**
  1. Crie os componentes de estatísticas e gráficos usando bibliotecas leves no cliente.
  2. Busque os dados assincronamente no servidor através de Server Components e injete no painel.
* **Documentação Relacionada:**
   * [**`.agents/skills/ui-ux-pro-max/SKILL.md`**](./.agents/skills/ui-ux-pro-max/SKILL.md)

### 6. Quero Integrar Inteligência Artificial (Engine CLI & Workflows)
* **Objetivo:** Rodar diagnósticos de infraestrutura e orquestrar buscas inteligentes de contexto no código do workspace.
* **Comandos da Engine V4:**
  * Para rodar diagnósticos de integridade locais:
    ```bash
    pnpm run test
    ```
  * Para validar a tipagem TypeScript:
    ```bash
    pnpm run typecheck
    ```
  * Para simular/rodar builds locais da engine:
    ```bash
    pnpm run build
    ```
* **Documentação Relacionada:**
  * [**`WHY.md`**](./WHY.md)
  * [**`BEST_PRACTICES.md`**](./docs/guides/BEST_PRACTICES.md)
   * [**`framework-engine/API.md`**](./framework-engine/API.md)

---

## 📌 Onde encontro cada informação?

| Tópico | Pasta de Destino | Descrição |
|---|---|---|
| **Arquitetura** | [`docs/architecture/`](./docs/architecture/) | Diretrizes de congelamento e contratos de capabilities. |
| **Guias** | [`docs/guides/`](./docs/guides/) | Manuais práticos de desenvolvimento, boas práticas e migrações. |
| **Histórico** | [`docs/history/`](./docs/history/) | Relatórios históricos de progresso de Sprints concluídas da V4. |
| **Referências** | [`docs/references/`](./docs/references/) | Listas de ferramentas MCP e mapeamentos de diretórios. |
| **Framework Engine** | [`docs/framework/`](./docs/framework/) | Manuais de referência técnicos das APIs e funcionamento da Engine V4. |
