# Capability: Capability Loader (v3-capability-loader)

Esta Capability define a especificação conceitual do selecionador e inicializador de capacidades da Framework Engine. Ela pertence à camada de controle da Engine, sendo responsável por mapear os metadados de uma Work Unit e acoplar a Capability ideal de execução.

---

## 🎯 Objetivo
Avaliar os metadados de uma Work Unit (tipo, escopo, domínio, complexidade) e selecionar deterministicamente qual Capability da biblioteca deve ser carregada na Execution Engine para aquela tarefa.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Analisar a assinatura de metadados da Work Unit ativa enviada pelo Control Plane.
* Consultar o catálogo de metadados das Capabilities disponíveis na biblioteca.
* Aplicar o algoritmo de seleção para encontrar a Capability ideal com base nos critérios de prioridade e compatibilidade.
* Definir o plano de fallback caso a Capability primária sugerida não esteja disponível.
* Rejeitar e barrar a execução caso a Work Unit contenha especificações de múltiplos domínios conflitantes (Casos Inválidos).
* Fornecer ao Capability Loader da Engine a chave identificadora da Capability a ser carregada.

### Entradas (Inputs)
* Definição da Work Unit ativa contendo seus metadados (Tipo, Escopo, Complexidade, Domínio, Dependências, Capability sugerida).
* Catálogo de metadados de todas as Capabilities registradas na biblioteca.

### Saídas (Outputs)
* Identificador exclusivo da Capability selecionada (ex: `v3-capability-ui`).
* Parâmetros de contexto hidratado mínimos exigidos pela Capability selecionada.

### Dependências
* Planning Capability e Control Plane.

---

## 📚 Injeção de Contexto (Context Hydration)

### Knowledge Layer Requerida
* [architecture-principles.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/architecture-principles.md)

### Rules Requeridas
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md)
* [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)

### Runtime Context (Arquivos Carregados)
* Mapeamento de metadados da Work Unit ativa.
* `.agents/capabilities/` (Catálogo conceitual de leitura de metadados).

---

## ⚙️ Configurações de Toolchain
Esta Capability atua exclusivamente no nível analítico de controle de fluxo de execução, **não realizando modificações físicas** no código ou acionando compiladores locais.

---

## 🚫 Restrições de Escopo (Fronteiras)
* **Não executa a Work Unit:** O Loader apenas seleciona e autoriza o carregamento; a escrita do código em si ocorre pela Execution Engine sob a Capability selecionada.
* **Não escreve código:** Proibido propor alterações de arquivos lógicos em `src/`.
* **Não altera Work Units:** O Loader não pode reescrever ou alterar o conteúdo da Work Unit planejada.

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* Escolha da Capability correspondente perfeita com base na correspondência de domínios e tipo de tarefa.
* Detecção e interrupção imediata de Work Units inválidas (contendo metadados conflitantes).
* Resolução rápida do fallback correto caso a capacidade primária esteja indisponível.

### Critérios de Falha
* Escolha de uma Capability com domínio incompatível com a tarefa (ex: carregar `write-ui` para criar uma tabela SQL).
* Falha em barrar Work Units com metadados truncados ou incompletos.
