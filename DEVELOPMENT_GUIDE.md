# Development Guide — Framework de Desenvolvimento Assistido por IA

Este é o manual definitivo do ecossistema de desenvolvimento do Devio Boilerplate V2. Aqui estão estabelecidas as diretrizes operacionais, fluxos de trabalho e a filosofia por trás do nosso "Sistema Operacional" para desenvolvimento integrado entre humanos e agentes de Inteligência Artificial.

## 🎯 Objetivo do Framework

O objetivo deste framework é padronizar, acelerar e elevar a qualidade do desenvolvimento de software através da orquestração de Agentes de IA. Ele não é apenas um template estrutural, mas sim um ambiente onde as regras, processos e validações estão codificados em documentação acessível e consumível por inteligências artificiais. O foco é garantir consistência arquitetural, segurança, performance e design premium em qualquer projeto gerado.

## 🧠 Filosofia de Desenvolvimento

Nosso ecossistema opera sob o princípio de **Desenvolvimento Guiado por Contexto (Context-Driven Development)**.
1. **Documentação como Código (Docs-as-Code):** As regras, guias e checklists não são apenas leitura para humanos; são instruções executáveis para agentes.
2. **Modularidade Estrita:** Cada peça do sistema possui uma responsabilidade única, refletida na estrutura do código (FSD) e na documentação (Roles, Workflows, Skills).
3. **Colaboração Híbrida:** A IA age como parceira de pair-programming, e o humano como revisor, estrategista e aprovador final.
4. **Hierarquia de Autoridade Clarificada:** O código-fonte sempre prevalece sobre os documentos. O repositório segue regras rígidas de precedência estabelecidas em [.agents/rules/authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md).
5. **Snapshot Operacional:** O arquivo `PROJECT_STATE.md` deixa de ser tratado como fonte absoluta da verdade e passa a ser reconhecido como um *Snapshot Operacional* (registro do último estado conhecido), permitindo que o código real sempre valide as decisões em caso de conflitos.

## 🔄 Ciclo e Fluxo de Desenvolvimento

O ciclo de vida de uma feature ou projeto segue um fluxo predeterminado estruturado a partir da **Classificação de Tarefas** e **Fast Track**:

### 📊 Classificação de Tarefas (Task Classification)
Antes de selecionar qualquer Workflow, o Manager deve classificar a tarefa de entrada em um dos quatro níveis de complexidade operacional:
* **Micro Task:** Ajustes microscópicos, correção de textos/copys, pequenas alterações isoladas ou pequenos ajustes de CSS. Qualifica-se para o fluxo **Fast Track**.
* **Small Feature:** Lógica de interface ou banco simples, afetando apenas um arquivo sem dependências amplas (ex: novo campo de formulário simples).
* **Feature:** Funcionalidade padrão com lógica de negócios, componentes visuais e banco (CRUD completo, tela nova, etc.). Exige workflow correspondente.
* **Epic:** Funcionalidades massivas ou integrações amplas de sistema. Devem ser obrigatoriamente faturadas em múltiplas Features menores antes da execução.

### ⚡ Modo Fast Track (Fluxo Simplificado)
Para tarefas de nível **Micro Task**, o framework disponibiliza o modo *Fast Track*. 
* **Quando usar:** Correções de texto, pequenos bugs cosméticos visuais, ajustes isolados em CSS ou arquivos individuais.
* **Como funciona:** O fluxo é extremamente simplificado: descarta o uso de Templates formais, separação estrita de fatias de Features ou Work Units complexas. O executor realiza a edição e avança diretamente para o commit, sem burocracias de especificações pesadas.
* **Quando NÃO usar:** Qualquer tarefa contendo lógica de banco, novas rotas, segurança, validação de inputs ou lógica de domínio de dados.

### 🔄 Fluxo de Desenvolvimento Padrão
1. **Concepção & Planejamento:** Entrada da demanda e classificação pelo Manager.
2. **Análise de Contexto:** Os agentes consultam a `always-read.md` e o mapa de caminhos no `FRAMEWORK_INDEX.md`.
3. **Seleção de Workflow:** O Manager seleciona o workflow correspondente (ex: `new-feature.md`, `crud.md`).
4. **Execução por Papéis (Roles):** A tarefa é fragmentada em Work Units e delegada para as respectivas *Roles* (`frontend.md` ou `backend.md`).
5. **Revisão:** Validação por meio do workflow `review.md` e do Checklist adequado (ex: `feature-done.md`).
6. **Deploy & Registro:** Atualização de logs, atualização do *Snapshot* no `PROJECT_STATE.md` e finalização.

## 🛠 Como Utilizar as Ferramentas do Ecossistema

### Chats Externos e IDEs (Integração IA)
* **Chats Externos:** Utilize-os para planejar tarefas macro, tirar dúvidas de arquitetura complexa ou gerar novos escopos. Sempre forneça acesso ao `PROJECT_STATE.md` e aos `workflows` aplicáveis para dar contexto inicial à IA.
* **IDE (Antigravity/Cursor/Windsurf):** Utilize o agente integrado à IDE para a codificação *hands-on*. A IDE tem acesso direto aos servidores MCP locais e às ferramentas de terminal, permitindo a execução autônoma (sob supervisão) de testes, auditorias e edições diretas de arquivos.

### 📚 Biblioteca de Skills (`.agents/skills/`)
As *Skills* representam a biblioteca de conhecimento especializado da agência catalogada no arquivo `AI_ARSENAL.md`. 
* **Autossuficiência do Framework:** O Framework é projetado para ser autossuficiente na maior parte das tarefas cotidianas de engenharia utilizando apenas as *Rules*, *Roles*, *Workflows*, *Knowledge Layer* e as especificações recebidas.
* **Caráter Opcional:** As Skills nunca substituem ou se sobrepõem às diretrizes principais do framework. Elas representam um complemento especializado (ex: padrões de acessibilidade extrema, conexões de infraestrutura específicas).
* **Prevenção de Context Bloat:** O carregamento indiscriminado de Skills aumenta drasticamente o consumo de tokens e a latência das IAs. Elas devem ser invocadas apenas quando houver benefício técnico explícito e necessidade declarada pelo Manager na triagem inicial.

### Como Utilizar Roles (`.agents/roles/`)
As *Roles* fragmentam o comportamento da IA. Em vez de um "agente que faz tudo", orientamos o agente a assumir um papel específico:
* `manager.md`: Orquestra o projeto, atualiza estados e divide tarefas.
* `frontend.md` / `backend.md` / `database.md`: Especialistas focados apenas em suas verticais, garantindo profundidade e rigor técnico.
* `reviewer.md`: Validador focado em qualidade, testes, code review avançado e checklists de conformidade.

### Como Utilizar Workflows (`.agents/workflows/`)
Os *Workflows* são receitas passo a passo para tarefas recorrentes (ex: criar uma landing page, implementar um CRUD, corrigir um bug). Quando uma demanda surge, o agente deve selecionar o fluxo correspondente e executá-lo linearmente.

### Como Funciona a Documentação
A documentação em `.ai-workspace/` atua como o sistema nervoso do projeto e opera em perfeita harmonia com o código-fonte (que é a autoridade máxima):
* O passado fica em `completed/` e `logs/`.
* O presente opera em `active/` e no Snapshot `PROJECT_STATE.md`.
* O futuro é desenhado em `roadmap/` e `specifications/`.
* **ADR (Architecture Decision Records):** Toda decisão arquitetural relevante (que mude caminhos de diretórios, padrões de dados ou bibliotecas) deve ser formalizada gerando um arquivo a partir de [.ai-workspace/templates/ADR_TEMPLATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/ADR_TEMPLATE.md) na pasta `.ai-workspace/decisions/`. Decisões antigas nunca são reescritas; novas decisões substituem antigas através da criação de novas ADRs, mantendo o histórico de evolução técnica imutável.

## 📁 Organização de Projetos

Independentemente de ser um site institucional ou um painel SaaS, todo projeto segue as convenções delineadas no `TEMPLATE_INSTRUCTIONS.md`, com forte ênfase em **Route Groups** e **Feature-Sliced Design (FSD)**. Nenhuma funcionalidade deve misturar responsabilidades globais e locais, garantindo máxima reutilização.

## ✅ Boas Práticas
* **Leia antes de Escrever:** Agentes e desenvolvedores sempre devem consultar as regras base antes de propor alterações.
* **Mantenha o Estado Atualizado:** O `PROJECT_STATE.md` deve ser um reflexo em tempo real da aplicação, atuando como o elo de sincronia para novos agentes.
* **Pequenos Passos (Baby Steps):** Mudanças grandes devem ser fracionadas em etapas menores para revisão eficiente e minimização de riscos.
* **Design Premium e Acessibilidade:** Nunca negocie a qualidade visual e a acessibilidade universal (A11y). O padrão de saída deve impressionar o usuário final.

---

## ⚙️ Fluxo Operacional

O funcionamento do framework em um projeto real segue um fluxo operacional rigoroso e sequencial dividido em 12 etapas de execução:

1. **Conversa no Chat Externo:** Alinhamento estratégico com o usuário humano sobre a nova funcionalidade, tela, CRUD ou correção de bug.
2. **Geração de Template:** Ao final do diálogo, preenchimento do template correspondente da pasta `.ai-workspace/templates/` (ex: `feature-template.md`, `crud-template.md`).
3. **Armazenamento em `.ai-workspace/specifications/`:** Salvamento do template preenchido como um arquivo de especificação estruturado.
4. **Leitura pelo Manager:** Abertura e análise da especificação pelo agente que assume a role `manager.md`.
5. **Seleção do Workflow:** Identificação e ativação do workflow mais aderente na pasta `.agents/workflows/` (ex: `new-feature.md`, `crud.md`).
6. **Divisão em Features:** Fracionamento de escopos em entregas lógicas de negócio.
7. **Divisão em Work Units:** Segmentação de cada feature em minúsculas Work Units técnicas de responsabilidade única.
8. **Delegação ao Role:** Passagem de bastão do Manager para a role especialista correspondente (`frontend.md` ou `backend.md`), fornecendo a Work Unit e as referências conceituais da `Knowledge Layer` pertinentes.
9. **Execução:** Codificação pura efetuada de forma isolada pela role correspondente, sob as diretrizes do `coding-style.md`.
10. **Checklist:** Submissão do código pronto ao checklist de validação de qualidade correspondente (ex: `feature-done.md`, `crud-done.md`) sob a supervisão do workflow `review.md`.
11. **Atualização do PROJECT_STATE:** Atualização sistemática do status da tarefa e do histórico de execução no `PROJECT_STATE.md`.
12. **Conclusão:** Chancela final da entrega e fechamento do ciclo, liberando a base de código para a próxima Work Unit.
