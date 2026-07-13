# Work Unit: [Título da Tarefa] (WU-[ID])

Este é o template oficial de definição de **Work Unit (WU)** da Framework Engine V3.0. Cada arquivo de tarefa ativa gerado pelo Control Plane/Planning Capability deve seguir rigorosamente esta estrutura para garantir o parse automático pelo Capability Loader e pelo Context Builder.

---

## 🏷️ Metadados de Identificação

* **ID:** `WU-[ID]` (ex: `WU-024`)
* **Objetivo:** [Descrição de uma linha do objetivo técnico da tarefa]
* **Capability Responsável:** `v3-capability-[nome]` (ex: `v3-capability-ui`)
* **Complexidade:** [Micro Task | Small Feature | Feature | Epic]
* **Status:** [Pendente | Em Execução | Validando | Concluído | Falhou]

---

## 🗺️ Grafo de Dependências e Conectividade

* **Dependências de Entrada (Bloqueado por):**
  * [ ] `WU-[ID-Anterior]` - [Nome da tarefa anterior]
* **Dependências de Saída (Bloqueia):**
  * [ ] `WU-[ID-Posterior]` - [Nome da tarefa posterior]

---

## 📥 Injeção de Contexto (Entradas)

### Requisitos Documentais (Mandaroty)
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) (Ancoragem absoluta de conduta).
* [Especificação da feature ou módulo associado]

### Códigos e Assinaturas (Passivo)
* [Caminho do arquivo de código existente a ser lido/estendido]

---

## 📤 Resultados Esperados (Saídas)

### Modificações Físicas Previstas
* **Arquivos a Criar:**
  * `[Caminho absoluto do arquivo a ser criado]`
* **Arquivos a Editar:**
  * `[Caminho absoluto do arquivo a ser editado]`

---

## 🏆 Critérios de Homologação

### Critérios de Aceite (Aceitação Técnica)
* [ ] [Critério técnico 1: ex: Componente exibe status dinâmicos.]
* [ ] [Critério técnico 2: ex: Não ultrapassar o limite de tempo de transição.]
* [ ] [Critério de acessibilidade A11y obrigatório associado.]

### Validação por Toolchain (Física)
* **Comandos de Auditoria:**
  * [ ] `npm run lint` (ESLint)
  * [ ] `tsc --noEmit` (TypeScript Compiler)
  * [ ] `npm run test` (Testes locais de regressão se configurados)
