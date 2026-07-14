# Manual do Desenvolvedor & Diretrizes de Desenvolvimento — Devio Master Boilerplate

Este repositório é o template mestre da agência para a criação de sites institucionais de alto desempenho e sistemas SaaS modernos, construído sobre uma base modular inspirada em Clean Architecture e organizada com Feature-Sliced Design (FSD). Este manual estabelece a arquitetura estrutural e as regras de desenvolvimento que devem ser rigorosamente seguidas por engenheiros de software e agentes de IA.

---

## 🛠 Stack Tecnológica

* **Framework:** Next.js 16.2+ (App Router & Turbopack)
* **Biblioteca Base:** React 19
* **Estilização:** Tailwind CSS v4
* **Animações:** Framer Motion (para micro-interações fluidas)
* **Ícones:** Lucide React
* **Banco de Dados & Autenticação:** Supabase Client via `@supabase/ssr`
* **Validação de Formulários:** Zod (schemas estáticos e runtime)
* **Execution & AI Context Engine:** Node.js + TypeScript (com suporte nativo a strip-types e protocolo MCP)

---

## 📂 Estrutura de Pastas e Roteamento

O projeto adota uma estrutura híbrida organizada com **Route Groups** do Next.js, **Feature-Sliced Design (FSD)** e a **Framework Engine** na pasta raiz:

```text
src/
├── app/
│   ├── (marketing)/           # Escopo Institucional (Landing Pages & SEO)
│   │   ├── layout.tsx         # Layout herdado com Header e Footer globais
│   │   └── page.tsx           # Página principal pública
│   ├── (auth)/                # Fluxos de Acesso (Login, Cadastro)
│   │   ├── layout.tsx         # Layout centralizado em tela cheia
│   │   └── login/             # Rota /login
│   ├── (app)/                 # Escopo de Sistema / SaaS (Área Restrita)
│   │   ├── layout.tsx         # App Shell com Sidebar fixa e Topbar superior
│   │   └── dashboard/         # Rota privada /dashboard (protegida por middleware)
│   ├── layout.tsx             # RootLayout raiz (<html>, <body> e globals.css)
│   ├── sitemap.ts             # Sitemap dinâmico utilizando a API de metadados
│   └── robots.ts              # Regras de robots.txt integradas
├── components/
│   ├── layout/                # Componentes estruturais (Header, Footer, Sidebar, Topbar)
│   ├── ui/                    # Componentes de UI genéricos reutilizáveis (botões, cards)
│   ├── forms/                 # Campos de formulário atômicos (BaseInput)
│   └── sections/              # Seções macro de páginas de marketing (Hero, Services)
├── features/                  # Regras de Negócio Modulares (FSD)
│   └── auth/                  # Módulo de Autenticação Base
│       ├── components/        # Componentes visuais da feature (login-form.tsx)
│       ├── schemas.ts         # Validações Zod (loginSchema)
│       └── actions.ts         # Server Actions assíncronas (loginAction)
├── config/                    # Configurações globais e centrais (site.ts, navigation.ts, permissions.ts)
└── lib/                       # Provedores e utilitários de infraestrutura
    ├── supabase/              # Inicialização do Supabase para Next.js SSR
    │   ├── client.ts          # Cliente para Client Components (createBrowserClient)
    │   ├── server.ts          # Cliente para Server Components (createServerClient)
    │   └── middleware.ts      # Utilitário para atualização de cookies no Middleware
    ├── env.ts                 # Validação estrita de variáveis de ambiente com Zod
    └── action-state.ts        # Tipo genérico para padronização de respostas de Server Actions

framework-engine/              # O motor inteligente de contexto de IA V4
├── src/
│   ├── knowledge/             # Núcleo de busca, Planner, Resolver, Cache e GraphManager
│   │   ├── ast/               # Projeção seletiva da árvore da AST
│   │   ├── cache/             # Cache semântico por similaridade de cosseno
│   │   ├── planner/           # Query Planner e estratégia de subqueries
│   │   ├── providers/         # Adaptadores (Graphify MCP, Markdown, OpenAI, etc.)
│   │   └── resolver/          # Resolvedores e agrupamento de resultados
│   ├── prompt/                # Prompt Assembly V2 (Budgets, Layout, Optimizer, Section)
│   ├── cli/                   # Linha de comando do desenvolvedor
│   └── diagnostics/           # Logs estruturados e spans de execução
└── sprint-*-report.md         # Histórico de homologação de entregas
```

---

## ⚠️ Regras de Ouro e Fluxos de Desenvolvimento

### 🥇 1. Organização do App Router (Route Groups)
* **`(marketing)` (Institucional)**:
  * Utilizado para landing pages, páginas de serviços, sobre, FAQ e documentações públicas.
  * O layout deste grupo renderiza automaticamente o `Header` e o `Footer`. Esses dois componentes **NUNCA** devem ser importados em páginas individuais.
* **`(auth)` (Autenticação)**:
  * Reservado exclusivamente para os fluxos de login, recuperação de senha e cadastro.
  * Centraliza o conteúdo no meio da tela com um layout limpo, mantendo o usuário focado nas ações de credenciais.
* **`(app)` (SaaS/Painel)**:
  * Agrupa a área restrita do cliente. 
  * O layout do grupo cria a estrutura de tela inteira (`Sidebar` à esquerda, `Topbar` superior e viewport com scroll autônomo).
  * **Middleware de Proteção**: O arquivo `src/middleware.ts` gerencia o controle de autenticação e proteção de rotas privadas. Por padrão, ele protege o caminho `/dashboard` (redirecionando para `/login` caso não haja sessão ativa). Novas rotas privadas como `/settings`, `/profile`, `/billing`, `/users` e `/admin` devem ser explicitamente mapeadas na lógica do middleware ou no array de configurações `matcher`.

### 📦 2. Desenvolvimento Modular (Feature-Sliced Design)
* Toda regra de negócio, comportamento específico do domínio (ex: autenticação, pagamentos, perfil de usuário) deve estar contida em `src/features/[feature-name]/`.
* A pasta de cada feature deve ser dividida em:
  1. **Componentes (`components/`)**: Formulários e displays visuais específicos da feature. Devem utilizar os componentes genéricos de UI e formulários (ex: `@/components/forms/BaseInput`) para renderização.
  2. **Schemas (`schemas.ts`)**: Esquemas estáticos criados via **Zod** para validação robusta dos parâmetros e formulários.
  3. **Server Actions (`actions.ts`)**: Métodos assíncronos anotados com `"use server"` que processam dados no servidor. Devem assinar e retornar o tipo genérico `ActionState<T>` importado de `@/lib/action-state` para garantir um padrão previsível de feedback na UI.

### 🔒 3. Integração com Supabase SSR
A inicialização do cliente Supabase varia de acordo com o contexto de execução:
* **No Navegador (Client Components - `"use client"`)**: Importe `createClient` de `@/lib/supabase/client` e instancie o cliente localmente.
* **No Servidor (Server Components, Actions e Route Handlers)**: Importe `createClient` de `@/lib/supabase/server` e instancie de forma assíncrona (já que depende da leitura de cabeçalhos e cookies).

### 🔐 4. Validação de Variáveis de Ambiente
* As variáveis de ambiente **nunca** devem ser acessadas diretamente no código através de `process.env`.
* Utilize sempre a constante tipada `env` importada do arquivo `@/lib/env`.
* Qualquer nova variável de ambiente introduzida na aplicação deve ser adicionada ao schema Zod de validação no arquivo `src/lib/env.ts` e listada no `.env.example` na raiz do projeto.

---

## ⚙️ Diretrizes de Evolução da Framework Engine V4 (Architecture Freeze)

A arquitetura da Framework Engine está declarada como **congelada (FROZEN)**. Para qualquer manutenção ou extensão, as seguintes regras devem ser rigidamente observadas:

### A. Desacoplamento da Knowledge Engine
* **Sem acoplamento de provedor**: A classe `KnowledgeEngine` nunca deve importar classes de adaptadores de terceiros de forma estática (como `GraphifyKnowledgeProvider`). Toda e qualquer tecnologia de busca deve estar encapsulada no seu próprio provider estendendo a interface `KnowledgeProvider`.
* **Sem IA no Core**: Todos os processos do planejador (`QueryPlanner`), resolvedor (`KnowledgeResolver`), compressor (`ContextCompressor`) e assembler (`PromptAssembler`) devem rodar de forma 100% determinística localmente em memória sem fazer chamadas a APIs de IA ou dependências externas em rede.

### B. Proteção contra Ghost State e Lazy Sync
* Qualquer consulta realizada no provider de grafos (`GraphifyKnowledgeProvider`) deve checar previamente o estado `dirty` com o `GraphProcessManager` e forçar a sincronização de desvios do watcher no disco (`synchronize()`) antes de retornar resultados. A Engine nunca pode ler dados de arquivos desatualizados.
* **Spawns Resilientes**: Todo subprocesso do servidor MCP spawnado dinamicamente com `child_process.spawn` no transporte de produção deve receber a diretiva `unref()` logo após a inicialização para evitar que handles abertos de stdin/stdout travem o event loop do processo pai.

### C. Prompt Assembly e Poda de Seções
* Toda seção do prompt (`PromptSection`) deve ter seu consumo de tokens calculado de forma determinística por caractere (heurística: `caracteres / 4`).
* Seções obrigatórias definidas no `PromptLayout` preset (como `System`, `Task` e `Rules`) devem estar obrigatoriamente presentes.
* Caso o tamanho total exceda o orçamento (`PromptBudget.usableBudget`), a poda automatizada de seções opcionais deve ser ativada no `PromptOptimizer` por prioridade linear decrescente (removendo seções opcionais de menor prioridade primeiro).

---

## 🎨 Acessibilidade, Performance e SEO (A11y & Vitals)

* **Formulários Acessíveis**: Utilize sempre o componente reutilizável `BaseInput` para a construção de inputs. Ele garante a vinculação semântica correta de labels e mensagens de erro via atributos ARIA (`aria-invalid`, `aria-describedby`), cruciais para leitores de tela.
* **SEO Nativo**: Todos os metadados globais devem ser referenciados usando o objeto `siteConfig` do arquivo `src/config/site.ts`. O sitemap (`src/app/sitemap.ts`) e o arquivo robots (`src/app/robots.ts`) geram automaticamente os links absolutos correspondentes de forma estática em tempo de compilação.
* **Animações Otimizadas**: Utilize o Framer Motion animando unicamente propriedades suportadas por aceleração de GPU (`opacity`, `transform`, `scale`) a fim de evitar recálculos de layout caros e assegurar nota máxima em estabilidade visual (CLS) e performance de tela.
