# Regras de Ouro e Boas Práticas — BEST PRACTICES

Este manual define as diretrizes regulatórias oficiais para o desenvolvimento, evolução e manutenção da **Devio Platform V4** e sua **Knowledge Engine**. Estas regras aplicam-se a desenvolvedores e agentes de IA.

---

## 🥇 Regras de Ouro do Framework (Inquestionáveis)

### 1. Nunca Editar ou Modificar a Engine para Casos Específicos
* **Diretriz:** A `KnowledgeEngine` e seus componentes (`QueryPlanner`, `PromptAssembler`, `ContextCompressor`) devem permanecer 100% genéricos e agnósticos.
* **Por quê:** Alterar o núcleo do framework para resolver uma particularidade de um projeto comercial quebra o desacoplamento e introduz regressões inesperadas. Qualquer ajuste deve ser feito via parametrizações de configuração ou novos adaptadores.

### 2. Toda Evolução Nasce de Casos de Uso Reais
* **Diretriz:** Melhorias estruturais na plataforma devem ser motivadas e testadas sob demandas de projetos comerciais reais.
* **Por quê:** Evita a criação de abstrações prematuras ou engenharia excessiva (Overengineering) que não geram valor de produto prático.

### 3. Nunca Quebrar Contratos Públicos
* **Diretriz:** As assinaturas das interfaces expostas no index global do framework (como `KnowledgeProvider`, `KnowledgeRequest`, `KnowledgeResult`) estão declaradas como **congeladas (FROZEN)**.
* **Por quê:** Alterações que quebrem compatibilidade quebram integrações de tooling e agentes de IA integrados à plataforma.

### 4. Sempre Utilizar Capabilities e Workflows Locais
* **Diretriz:** Operações complexas (como criar novas páginas, CRUDs ou refatorações) devem ser coordenadas baseando-se nas instruções estruturadas em `.agents/workflows/` e `.agents/capabilities/`.
* **Por quê:** Garante consistência metodológica entre diferentes engenheiros de software e agentes que alteram a base de código.

---

## 🛠️ Regras de Desenvolvimento de Código (Frontend & Backend)

### 5. Priorize Server Components (Next.js App Router)
* **Diretriz:** Sempre crie componentes como Server Components por padrão. A diretiva `"use client"` deve ser restrita apenas a blocos de interface que necessitam de interações do usuário, hooks de estado do React (`useState`, `useEffect`) ou APIs do browser.
* **Por quê:** Otimização máxima de performance de renderização no servidor e redução de bundle enviado ao cliente.

### 6. Nunca Importar Componentes Globais de Layout em Páginas
* **Diretriz:** Componentes como `Header` e `Footer` (marketing) ou `Sidebar` e `Topbar` (SaaS) são injetados exclusivamente pelos layouts dos grupos de rotas correspondentes (`layout.tsx`).
* **Por quê:** Evita re-renderizações espúrias e mantém as páginas individuais 100% livres de dependências de layout (DRY).

### 7. Validação Estrita de Input e Ambientes (Zod)
* **Diretriz:** Toda entrada de dados de usuário ou do servidor deve ser validada por schemas Zod. Variáveis de ambiente nunca devem ser acessadas por `process.env`, mas sim através da constante tipada `env` em `@/lib/env`.
* **Por quê:** Captura falhas de configuração e dados em tempo de build/compilação, prevenindo falhas silenciosas de runtime.
