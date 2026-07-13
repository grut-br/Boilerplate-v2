# Taxonomia de Capabilities (Capability Taxonomy)

Este documento estabelece a classificação taxonômica oficial das **Capabilities** (habilidades técnicas modulares de IA) no ecossistema da Framework Engine V3.0, organizando-as em 12 categorias fundamentais.

---

## 🗺️ Tabela Geral da Taxonomia

| Categoria | Descrição do Escopo Técnico | Exemplo / Capability Representativa |
| :--- | :--- | :--- |
| **Planning** | Triagem de especificações e divisão em Work Units. | `v3-capability-planning` |
| **Documentation** | Escrita e atualização de READMEs, manuais e logs. | `v3-capability-documentation` |
| **Analysis** | Auditoria lógica de código sem modificação física. | `v3-capability-analysis` |
| **UI** | Criação de componentes visuais e estilização Tailwind. | `v3-capability-ui` (Planejado) |
| **Review** | Revisão geral de PRs e conformidade arquitetural. | `v3-capability-review` (Planejado) |
| **Refactor** | Otimização de código legado e expurgo de tech debt. | `v3-capability-refactor` (Planejado) |
| **Testing** | Geração e execução de testes locais de regressão. | `v3-capability-testing` (Planejado) |
| **Database** | Modelagem SQL e criação de migrações Supabase. | `v3-capability-database` (Planejado) |
| **Backend** | Lógicas de negócios, Server Actions e endpoints de APIs. | `v3-capability-backend` (Planejado) |
| **Frontend** | Hooks React, provedores de estados e lógicas de tela. | `v3-capability-frontend` (Planejado) |
| **Infrastructure** | Módulos de controle, gateway de terminal e RAM. | `v3-capability-loader`, `v3-capability-runtime-state` |
| **General** | Habilidade coringa para contingência documental. | `v3-capability-general` (Planejado) |

---

## 🔍 Detalhamento das Categorias

### 1. Planning (Planejamento)
*   **Finalidade:** Analisar especificações e estruturar grafos de execução.
*   **Fronteiras:** Proibido propor alterações de arquivos lógicos em `src/`.
*   **Exemplo:** [Planning Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/planning.md).

### 2. Documentation (Documentação)
*   **Finalidade:** Redigir explicações de engenharia, especificações e relatórios em formato Markdown (.md).
*   **Fronteiras:** Proibido alterar qualquer arquivo com extensão de código.
*   **Exemplo:** [Documentation Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/documentation.md).

### 3. Analysis (Análise)
*   **Finalidade:** Avaliar a qualidade lógica e conformidade FSD de forma 100% passiva.
*   **Fronteiras:** Permissão exclusiva de leitura passiva em `src/` e escrita restrita à logs de análise.
*   **Exemplo:** [Analysis Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/analysis.md).

### 4. UI (User Interface)
*   **Finalidade:** Construir a camada de apresentação visual utilizando Next.js e Tailwind CSS v4.
*   **Fronteiras:** Autorizado a escrever apenas em `src/components/ui/`, `src/app/(marketing)/` e semelhantes.

### 5. Review (Revisão)
*   **Finalidade:** Examinar modificações concluídas e validar o cumprimento de checklists de homologação.
*   **Fronteiras:** Não efetua edições; apenas atesta conformidade estrutural.

### 6. Refactor (Refatoração)
*   **Finalidade:** Reestruturar código para otimizar legibilidade, desacoplamento e performance sem alterar o comportamento externo.
*   **Fronteiras:** Exige validação sequencial de testes unitários após gravação física.

### 7. Testing (Testes)
*   **Finalidade:** Criar suítes de testes unitários (Jest) ou E2E (Playwright).
*   **Fronteiras:** Escrita restrita a arquivos com extensões `.test.ts`, `.spec.tsx` ou semelhantes.

### 8. Database (Banco de Dados)
*   **Finalidade:** Criar esquemas de tabelas, relacionamentos e políticas de segurança RLS.
*   **Fronteiras:** Autorizado a gravar apenas na pasta de migrations do banco de dados (Supabase SQL).

### 9. Backend (Lógica do Servidor)
*   **Finalidade:** Escrever lógicas complexas de negócios de servidor, integrações de APIs e Server Actions.
*   **Fronteiras:** Restrito às subpastas `/actions.ts`, `/route.ts` ou arquivos FSD correspondentes.

### 10. Frontend (Apresentação Dinâmica)
*   **Finalidade:** Desenvolver hooks customizados de controle de estado do React, context providers e integração de dados locais.
*   **Fronteiras:** Escrita restrita a lógicas do cliente na pasta `src/`.

### 11. Infrastructure (Controle de Módulos)
*   **Finalidade:** Gerenciar e orquestrar o ciclo operacional da Engine (Loader, State, Builder, Processor).
*   **Fronteiras:** Módulos internos congelados e protegidos por políticas restritivas de alteração.

### 12. General (Geral)
*   **Finalidade:** Agir de forma versátil como alternativa de emergência sintática ou sob controle supervisionado pelo desenvolvedor humano.
*   **Fronteiras:** Teto máximo de orçamento de tokens baixo para evitar context drift.
