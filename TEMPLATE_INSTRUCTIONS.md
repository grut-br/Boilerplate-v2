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

---

## 📂 Estrutura de Pastas e Roteamento

O projeto adota uma estrutura híbrida organizada com **Route Groups** do Next.js e **Feature-Sliced Design (FSD)** para modularizar as regras de negócios:

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
  3. **Server Actions (`actions.ts`)**: Métodos assíncronos anotados com `"use server"` que processam dados no servidor. **Regra obrigatória:** Devem assinar e retornar o tipo genérico `ActionState<T>` importado de `@/lib/action-state` para garantir um padrão previsível de feedback na UI (success, message, errors, data).

### 🔒 3. Integração com Supabase SSR
A inicialização do cliente Supabase varia de acordo com o contexto de execução:
* **No Navegador (Client Components - `"use client"`)**: Importe `createClient` de `@/lib/supabase/client` e instancie o cliente localmente:
  ```typescript
  import { createClient } from "@/lib/supabase/client";
  const supabase = createClient();
  ```
* **No Servidor (Server Components, Actions e Route Handlers)**: Importe `createClient` de `@/lib/supabase/server` e instancie de forma assíncrona (já que depende da leitura de cabeçalhos e cookies):
  ```typescript
  import { createClient } from "@/lib/supabase/server";
  const supabase = await createClient();
  ```

### 🔐 4. Validação de Variáveis de Ambiente
* As variáveis de ambiente **nunca** devem ser acessadas diretamente no código através de `process.env`.
* Utilize sempre a constante tipada `env` importada do arquivo `@/lib/env`.
* Qualquer nova variável de ambiente introduzida na aplicação deve ser adicionada ao schema Zod de validação no arquivo `src/lib/env.ts` e listada no `.env.example` na raiz do projeto, para garantir que o build falhe caso alguma variável crítica seja omitida.

## ⚙️ Recursos Opcionais por Projeto

Para manter o boilerplate o mais leve, flexível e agnóstico possível, os seguintes módulos são catalogados como opcionais. Eles **não** devem ser pré-instalados na base, mas implementados conforme a necessidade do projeto final:
* **CI/CD Automatizado**: Configuração de deploys contínuos e pipelines via GitHub Actions ou Vercel.
* **Performance Budget**: Limitação estrita de tamanhos de carregamento e monitoramento de bundles.
* **Testes Automatizados**: Implementação de testes unitários com Vitest e testes E2E com Playwright.
* **Supabase Admin**: Uso do cliente com chaves administrativas no lado do servidor (ex: `service_role`).
* **Integrações Adicionais**: Gateways de pagamentos, serviços de e-mail e CRMs externos.

---

## 🎨 Acessibilidade, Performance e SEO (A11y & Vitals)

* **Formulários Acessíveis**: Utilize sempre o componente reutilizável `BaseInput` para a construção de inputs. Ele garante a vinculação semântica correta de labels e mensagens de erro via atributos ARIA (`aria-invalid`, `aria-describedby`), cruciais para leitores de tela.
* **SEO Nativo**: Todos os metadados globais devem ser referenciados usando o objeto `siteConfig` do arquivo `src/config/site.ts`. O sitemap (`src/app/sitemap.ts`) e o arquivo robots (`src/app/robots.ts`) geram automaticamente os links absolutos correspondentes de forma estática em tempo de compilação.
* **Animações Otimizadas**: Utilize o Framer Motion animando unicamente propriedades suportadas por aceleração de GPU (`opacity`, `transform`, `scale`) a fim de evitar recálculos de layout caros e assegurar nota máxima em estabilidade visual (CLS) e performance de tela.
