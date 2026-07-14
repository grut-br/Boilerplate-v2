# Development Guide — Framework de Desenvolvimento Assistido por IA V3.0

Este é o manual definitivo de direção operacional do **AI Development Framework V3.0**. Aqui estão estabelecidos os conceitos arquiteturais, fluxos conceituais de trabalho e a filosofia por trás do nosso ecossistema integrado entre desenvolvedores humanos, o **Control Plane** (inteligência de planejamento semântico) e a **Execution Engine** (motor cognitivo de modificação de código) utilizando a **Toolchain** local.

> [!IMPORTANT]
> **Nota de Alinhamento Arquitetural (Sprint V3.1-01A):**
> A arquitetura de monorepo experimental da Sprint V3.1-01 foi reclassificada como **Proof of Concept (PoC)** e completamente removida do Boilerplate para evitar acoplamento físico prematuro.
> A Framework Engine V3.1 física será desenvolvida em um **repositório independente**. O Boilerplate permanece unicamente como um **consumidor independente** da Engine, orientando suas execuções através dos metadados e regras descritas na camada cognitiva local (`.agents/` e `.ai-workspace/`).

---

## 🎯 Objetivo do Framework

O objetivo deste framework é padronizar, acelerar e elevar a qualidade do desenvolvimento de software através da integração controlada e determinística de motores cognitivos de IA. Em vez de simular personas de equipe, o framework fornece um conjunto de **Capabilities** (capacidades técnicas modulares) que executam ações diretas sobre o repositório, garantindo consistência arquitetural, segurança, performance e design premium.

---

## 🧠 Filosofia de Desenvolvimento

Nosso ecossistema opera sob o princípio de **Desenvolvimento Guiado por Contexto (Context-Driven Development)**:
1. **Documentação como Código (Docs-as-Code):** As diretrizes de design, regras de codificação e checklists técnicos servem de insumo direto para o **Context Builder**, que constrói dinamicamente o escopo para a Engine.
2. **Modularidade por Capabilities:** Nenhuma IA opera com escopo aberto. O planejamento de modificações é faturado em tarefas atômicas executadas sob uma Capability técnica explícita.
3. **Plano de Controle Semântico (Control Plane):** A análise de demandas do usuário e a estruturação de planos de implementação ocorrem em um nível conceitual, separado da execução de escrita de código.
4. **Validação por Toolchain:** Toda alteração é submetida automaticamente a testes, linters e builds locais fornecidos pela Toolchain de desenvolvimento.
5. **Estado de Execução Contínuo (State):** O andamento do projeto é monitorado e sincronizado transacionalmente no repositório.

---

## 🔄 Ciclo e Fluxo de Desenvolvimento Conceitual

O ciclo de vida de uma modificação técnica segue um fluxo conceitual em 5 etapas:

### 1. Triagem & Classificação
A demanda de entrada do usuário é analisada pelo **Control Plane** e classificada de acordo com a complexidade técnica:
* **Micro Task:** Pequenos ajustes cosméticos, correções textuais ou alterações de layout isoladas. Qualificam-se para execução simplificada (Fast Track).
* **Small Feature:** Modificações simples de interface ou lógica de dados que afetam escopos limitados.
* **Feature:** Funcionalidades padrão contendo lógica de interface, regras de negócio e validações.
* **Epic:** Escopos amplos que devem ser decompostos pelo Control Plane antes de iniciar o desenvolvimento.

### 2. Planejamento Semântico
O Control Plane gera o plano conceitual de modificações, mapeando os arquivos afetados e as dependências estruturais do repositório.

### 3. Montagem do Contexto (Context Builder)
O **Context Builder** recolhe as regras absolutas, as diretrizes de código necessárias e os arquivos de código correspondentes, montando o payload de contexto ideal para a Execution Engine.

### 4. Execução (Execution Engine & Capabilities)
A **Execution Engine** consome as capacidades técnicas modulares (**Capabilities**) necessárias para aplicar as alterações físicas nos arquivos do repositório de forma atômica e limpa.

### 5. Homologação & Commit
A **Toolchain** local executa as validações automáticas (lint, TypeScript compiler, testes unitários). Se aprovado, o estado do projeto (**State**) é atualizado e o ciclo é encerrado.

---

## 🏛️ Módulos da Engine V3.0 (Congelados)

Os seguintes módulos e conceitos compõem o núcleo operacional estável da Framework Engine:
* **Control Plane:** Camada analítica responsável pelo parsing de especificações e orquestração do grafo de modificações.
* **Execution Engine:** Motor técnico de escrita que traduz o plano de execução em edições físicas reais de código no repositório.
* **Capabilities Library:** Coleção de especializações cognitivas modulares (ex: `planning`, `result-processor`).
* **Context Builder:** Algoritmo dinâmico de hidratação de contexto mínimo.
* **Runtime State:** Memória temporária de execução e controle transacional de reversão e isolamento.
* **Toolchain Gateway:** Conector físico para auditoria de validadores locais (compiladores, linters, testes).
* **Result Processor:** Consolidador de fechamento de ciclo e atualização documental de progresso.

---

## ✅ Boas Práticas Gerais
* **Abstrações Limpas:** Mantenha separação clara de responsabilidades no código (SoC) para facilitar a leitura da Execution Engine.
* **Sincronia do Estado:** Mantenha o arquivo `PROJECT_STATE.md` atualizado a cada avanço para manter a sintonia semântica com o Control Plane.
* **Fidelidade à Toolchain:** Correções apontadas pelo linter local devem ser priorizadas imediatamente antes de prosseguir com qualquer incremento lógico.

---

## ❄️ Engine Freeze Policy (Política de Congelamento)

Após a consolidação da versão 3.0, os seguintes elementos fundamentais da Framework Engine encontram-se permanentemente congelados:
* **Módulos do Núcleo (Core Modules):** A estrutura de execução lógicas dos módulos.
* **Pipeline de Execução:** O fluxo determinístico e sequencial de transações.
* **Capabilities Contracts:** A API conceitual obrigatória de Capabilities.
* **Framework Index:** A tabela de resolução e mapeamento de contexto.
* **Runtime:** As regras de alocação de memória volátil e reversões físicas.

> [!WARNING]
> Quaisquer modificações sobre estes arquivos ou conceitos estão estritamente proibidas para o desenvolvimento de features comuns. Ajustes arquiteturais nestes componentes congelados somente podem ocorrer mediante a aprovação explícita e emissão de um registro formal de decisão arquitetural (ADR).

---

## 🏛️ Architecture Stability Rules (Regras de Estabilidade)

A governança assistida por IA da V3 impõe as seguintes restrições de crescimento estrutural:
1. **Sem Crescimento Horizontal do Core:** A Framework Engine não pode expandir-se adicionando novos rituais ou arquivos no núcleo.
2. **Extensibilidade por Extensão:** Novas funcionalidades e comportamentos técnicos devem entrar exclusivamente através das seguintes estruturas do ecossistema:
   * **Capabilities:** Criação de novos drivers de escrita isolados (ex: `write_logic`, `write_styles`).
   * **Specifications:** Detalhamento funcional de novas regras de negócio e de interface.
   * **ADRs:** Registro de novas tomadas de decisões arquiteturais do projeto.
   * **Templates:** Padronização de novos placeholders reutilizáveis.
3. **Imutabilidade da Engine:** Capabilities operacionais são executoras; elas não modificam, herdam ou alteram as premissas estruturais da própria Engine de execução.

---

## 🛠️ Operational Usage (Uso Operacional da Engine)

Esta seção define como iniciar, interromper, reiniciar e classificar tarefas lógicas no ecossistema da Framework Engine V3.0.

### 🔌 Inicialização, Interrupção e Reinicialização

1. **Como Iniciar:**
   * Crie uma Specification Markdown em `.ai-workspace/specifications/[nome-da-feature].md` contendo escopo e objetivos.
   * Inicialize a Engine lendo o ponto de entrada oficial [FRAMEWORK_ENTRYPOINT.md](../framework/FRAMEWORK_ENTRYPOINT.md).
   * O Control Plane disparará a triagem inicial pela Planning Capability.
2. **Como Interromper:**
   * Para suspender a execução transacional ativa da Engine em caso de desvios, o desenvolvedor humano deve emitir a instrução de `ABORT` no console.
   * O Result Processor interceptará o comando, efetuará o checkout/reversão dos arquivos modificados temporariamente para o último estado íntegro no Git e descartará o Runtime State.
3. **Como Reiniciar:**
   * Apague o UUID da transação falha no Runtime State.
   * Garanta que os arquivos de código estejam no estado estável anterior e execute a limpeza do buffer.
   * Dispare a Engine novamente a partir do [FRAMEWORK_ENTRYPOINT.md](../framework/FRAMEWORK_ENTRYPOINT.md) referenciando a especificação de origem.

### 📐 Tipologias de Tarefas (Divisão e Escopo)

* **Como criar Micro Tasks (Fast Track):**
  * Use para manutenções rápidas e pontuais (ex: "Ajustar padding", "Mudar cor").
  * A Engine ignora a criação física de Work Units separadas e executa a modificação sob uma transação acelerada de bypass direto (Fast Track), rodando validações apenas no arquivo afetado.
* **Como criar Features (Esteira Padrão):**
  * Use para novos componentes ou lógicas integradas (ex: "Criar formulário de contato").
  * O planejador gera entre 2 e 4 Work Units de responsabilidade atômica que executam de forma linear. Cada WU consome uma Capability especializada (ex: `v3-capability-ui`, `v3-capability-testing`).
* **Como criar Epics (Divisão em Múltiplos Planos):**
  * Use para transformações estruturais complexas (ex: "Substituir banco de dados").
  * A Planning Capability é proibida de gerar uma única WU gigante. Ela deve estruturar um plano macro de decomposição de negócio e exigir que o Control Plane divida o Epic em múltiplas subespecificações sequenciais de Features antes de liberar o pipeline físico de escrita.
