# Contrato Arquitetural de Capabilities — V3.0

Este documento define o padrão oficial de contrato técnico e arquitetural que todas as **Capabilities** (capacidades funcionais de IA) da versão 3.0 do framework devem seguir. Ele estabelece os limites operacionais, estrutura e ciclo de vida necessários para garantir a modularidade e o determinismo de escrita de código.

---

## 🏛️ O que é uma Capability

Uma **Capability** é uma unidade de especialização técnica modular da Execution Engine. Ela representa uma habilidade funcional da IA (ex: construir um componente de interface, criar um endpoint de API, validar a segurança de um payload). Ela encapsula apenas as regras de código, checklists de validação e diretrizes mínimas requeridas para aquela ação.

## 🎯 Por que ela substitui Roles (Papéis)

Na versão V2, o framework utilizava *Roles* baseadas em personas de equipe (ex: frontend, backend, manager). Isso gerava três problemas de engenharia:
1. **Context Overlap (Sobreposição de Contexto):** Personas de equipe carregavam instruções gerais de comportamento (como se portar no chat) misturadas a diretrizes de escrita, inflacionando o contexto da IA.
2. **Falta de Determinismo:** Personas agem de forma criativa de acordo com a heurística do modelo; Capabilities agem como interfaces programáticas estritas, executando passos rígidos.
3. **Escala Ineficiente:** Invocação de papéis inteiros gera sobreposição redundante de escopo (ex: o programador frontend muitas vezes interagia com lógica que exigia backend, confundindo a IA sobre qual persona assumir).

As Capabilities substituem personas de equipe por **habilidades isoladas ativadas sob demanda**.

---

## 🔌 Integração à Framework Engine

A Capability atua como o driver de modelagem de código carregado pela Execution Engine. O **Control Plane** decide qual Capability é necessária para o passo atual do plano, o **Context Builder** recolhe os arquivos estritamente acoplados, e a Engine aplica a alteração orientada pelas regras da Capability ativa, validando-a imediatamente na Toolchain.

## 🚧 Limites de Responsabilidade

* **Sem Planejamento Geral:** A Capability não planeja o fluxo de tarefas ou as sprints; ela atua apenas na micro-execução de sua função técnica específica.
* **Sem Persistência de Estado Global:** A Capability é volátil; ela entra em cena, executa sua tarefa e é descartada do contexto, não mantendo histórico de turnos anteriores.
* **Sem Ações Diretas na Toolchain:** A Capability fornece o conhecimento das ferramentas locais a serem usadas, mas a chamada física e o processamento de logs das ferramentas ocorrem no Toolchain Gateway da Engine.

---

## 📐 Estrutura Oficial de uma Capability

Cada Capability especificada no framework deve conter obrigatoriamente as seguintes chaves de definição:

1. **Nome (Name):** Identificador técnico e exclusivo (ex: `write-ui-component`).
2. **Objetivo (Objective):** Declaração explícita de sua finalidade técnica.
3. **Responsabilidades (Responsibilities):** Lista atômica de ações sob seu escopo.
4. **Entradas (Inputs):** Parâmetros e dados conceituais esperados (arquivos de especificação, ADRs).
5. **Saídas (Outputs):** Arquivos físicos e alterações de código resultantes esperadas.
6. **Dependências (Dependencies):** Outros módulos ou classes do repositório relacionados.
7. **Knowledge Necessária (Required Knowledge):** Referências conceituais da Knowledge Layer (ex: [accessibility.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/accessibility.md)).
8. **Rules Necessárias (Required Rules):** Referências de estilo e comportamento técnico (ex: [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md)).
9. **Workflows Compatíveis (Compatible Workflows):** Fluxos operacionais do repositório relacionados.
10. **Runtime Context Esperado (Expected Runtime Context):** Estrutura mínima de arquivos ativos injetada na chamada.
11. **Toolchain Utilizada (Used Toolchain):** Lista de validadores locais acionados por ela (ex: eslint, tsc).
12. **Restrições (Restrictions):** Limites técnicos estritos (o que ela NÃO pode modificar ou acessar).
13. **Critérios de Sucesso (Success Criteria):** Regras de validação estritas para aprovação da modificação.
14. **Critérios de Falha (Failure Criteria):** Gatilhos explícitos que cancelam a execução e exigem refatoração ou reversão.

---

## 🏷️ Metadados de Autodeclaração (Capability Metadata)

Toda Capability deve expor obrigatoriamente um cabeçalho estruturado de metadados em formato YAML ou tabela no topo do seu arquivo de definição, facilitando o parse determinístico pelo `v3-capability-loader`. A declaração deve conter:

* **Capability Name:** O identificador global exclusivo (ex: `v3-capability-ui`).
* **Supported Domains:** Lista de domínios FSD onde ela tem autorização para atuar (ex: `ui`, `components`).
* **Supported Task Types:** Tipologias de tarefas técnicas aceitas por ela (ex: `visual-interface`, `css-style`).
* **Inputs:** Tipos de arquivos de entrada consumidos (ex: specifications, code-files).
* **Outputs:** Lista de tipos de alterações físicas geradas (ex: component-files, css-rules).
* **Required Context:** Lista de arquivos de regras do framework obrigatórios na hidratação de contexto (ex: `rules/coding-style.md`).
* **Optional Context:** Guias de conhecimento opcionais carregados condicionalmente (ex: `knowledge/accessibility.md`).
* **Execution Limits:** Regras de bloqueio e restrições estritas de alteração.
* **Success Conditions:** Lista de validações locais obrigatórias para homologação.
* **Failure Conditions:** Condições de erro explícitas que disparam rollback automático.
* **Resolution Metadata:** Agrupador de parâmetros de resolução da Engine.
  * **Keywords:** Termos e palavras-chave associadas à Capability (ex: `["tailwindcss", "button"]`).
  * **Domains:** Lista de subdomínios de atuação.
  * **Confidence:** Grau numérico/qualitativo de estabilidade e acurácia (`High` / `Medium` / `Low`).
  * **Priority:** Escala de prioridade para regras de desempate de resolução (`1` a `10`).
  * **Dependencies:** Array de dependências físicas de outras Capabilities de injeção.


---

## 💧 Requisitos de Contexto (Context Requirements)

Para garantir o controle de injeção de tokens, toda Capability deve declarar explicitamente sua assinatura de requisitos de contexto contendo as seguintes propriedades:

* **Mandatory Context:** Lista de arquivos conceituais ou de regras do framework cuja presença no prompt é inegociável para a execução correta da tarefa.
* **Optional Context:** Lista de guias ou bases da Knowledge Layer carregados de forma dinâmica sob demanda (Lazy Loading).
* **Forbidden Context:** Lista de caminhos ou guias conceituais expressamente proibidos de carregar, para evitar poluição semântica de ideias.
* **Maximum Context Budget:** Teto máximo tolerável de tokens permitidos no payload de contexto montado para a tarefa (ex: 8.000 tokens).
* **Context Strategy:** A estratégia do construtor para redução de escopo (ex: `lazy-load-knowledge`, `header-only-signatures`).

---

## ⚙️ Diretrizes de Execução Física (Execution Requirements)

Para orquestrar a gravação e modificações no repositório de forma determinística, toda Capability deve declarar sua assinatura de diretrizes de execução contendo as seguintes propriedades:

* **Execution Scope:** Mapeamento de diretórios lógicos do repositório onde a gravação física de código está autorizada.
* **Execution Constraints:** Regras estritas de controle de modificação (ex: proibido alterar arquivos de configuração global como `tailwind.config` ou `package.json`).
* **Expected Result:** Descrição do comportamento físico final esperado após a gravação da alteração.
* **Maximum Output:** Limite máximo tolerável de linhas de código ou arquivos criados (ex: máximo de 150 linhas por componente editado).
* **Allowed Side Effects:** Lista de efeitos colaterais aceitáveis decorrentes da modificação (ex: criação de exportações ou registros no index central).

---

## 🧪 Diretrizes de Validação e Auditoria (Validation Requirements)

Para auditar o código alterado de forma física e determinística, toda Capability deve declarar sua assinatura de validação contendo as seguintes propriedades:

* **Validation Strategy:** Abordagem técnica para verificação de bugs (ex: `static-analysis-first`, `unit-testing`).
* **Validation Commands:** Comandos exatos de terminal a serem acionados localmente pela Toolchain (ex: `npm run lint`, `tsc --noEmit`).
* **Expected Validation:** Resultado lógico esperado que atesta conformidade total da tarefa.
* **Rollback Strategy:** Plano de reversão física de código no repositório caso os validadores acusem erros de compilação ou falhas estáticas.

---

## 💾 Diretrizes de Memória Volátil (Runtime Requirements)

Para operar em harmonia com o ciclo de transação da Engine, toda Capability deve declarar as seguintes propriedades de memória volátil:

* **Runtime Inputs:** Variáveis de estado iniciais lidas da memória ativa no início do turno (ex: UUID, Work Unit ID).
* **Runtime Outputs:** Informações técnicas e logs gravados pela Capability na memória volátil ao término de sua execução.
* **Runtime Mutations:** Lista de chaves do estado operacional que a Capability tem autorização de alterar.
* **Runtime Cleanup:** Instruções de remoção e purga de contexto cognitivo pós-validação local.
* **Execution Isolation:** Regras para blindar o processamento da Capability contra concorrência ou herança indesejada de dados.

---

## 🏁 Diretrizes de Consolidação e Fechamento (Result Requirements)

Para homologar a tarefa de forma transacional, toda Capability deve declarar as seguintes propriedades de fechamento de ciclo:

* **Success Criteria:** Condições explícitas que autorizam a marcação da Work Unit como concluída.
* **Failure Criteria:** Condições explícitas de erros ou violações que disparam a invalidação do turno.
* **Rollback Behaviour:** Instruções sobre como restaurar a integridade física de arquivos em caso de falhas consecutivas.
* **State Update:** Mapeamento de quais campos do estado do projeto global devem ser atualizados.
* **Log Strategy:** Diretrizes para persistência de relatórios e logs de auditoria no repositório.

---

## 📜 Registro de Capabilities Oficiais

Abaixo estão registradas as Capabilities homologadas e disponíveis no ecossistema da Framework Engine V3.0:

1. **[Documentation Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/documentation.md)** (`v3-capability-documentation`) [Operational Capability - Status: Validated]: Primeira Capability funcional operacional da V3.0, responsável por produzir documentação técnica padronizada (READMEs, changelogs, especificações e ADRs) de forma isolada, sem alteração de código ou execução de comandos.
2. **[Planning Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/planning.md)** (`v3-capability-planning`): Primeira Capability cognitiva encarregada de interpretar especificações, avaliar complexidades, identificar domínios e riscos técnicos, e decompor requisitos em Work Units sequenciais estruturadas.
3. **[Analysis Capability](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/analysis.md)** (`v3-capability-analysis`) [Plugin Capability - Status: Operational]: Capability de análise lógica passiva, projetada para demonstrar a extensibilidade e o acoplamento fraco de plugins da Engine, gerando relatórios de conformidade e auditoria estruturada sem interferir em arquivos lógicos.



