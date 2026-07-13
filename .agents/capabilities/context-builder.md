# Capability: Context Builder (v3-capability-context-builder)

Esta Capability define a especificação conceitual do construtor de contexto da Framework Engine. Ela pertence à camada de infraestrutura cognitiva da Engine, sendo responsável por filtrar, extrair e agrupar dinamicamente as informações fornecidas à Execution Engine para prevenir a sobrecarga de tokens (Context Bloat).

---

## 🎯 Objetivo
Montar o menor contexto útil e focado de arquivos conceituais, regras e código-fonte necessário para a execução determinística de uma Work Unit por uma Capability específica.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Receber a Work Unit ativa e a Capability designada pelo Capability Loader.
* Ler os requisitos de contexto declarados nos metadados da Capability.
* Consultar as regras de resolução de contexto no `FRAMEWORK_INDEX.md`.
* Acessar a árvore de diretórios do repositório para localizar os arquivos físicos indicados.
* Filtrar e remover dados e comentários redundantes ou arquivos fora de escopo.
* Compilar a carga útil mínima de dados de contexto (payload) e entregar para a Execution Engine.

### Entradas (Inputs)
* ID da Capability selecionada e domínio da tarefa.
* Detalhamento e metadados da Work Unit ativa.
* Arquivos conceituais de regras (`rules/`), guias (`knowledge/`) e código-fonte (`src/`).

### Saídas (Outputs)
* Payload de contexto compactado (Context Payload) estruturado pronto para a Execution Engine.

### Dependências
* Capability Loader, FRAMEWORK_INDEX.md e PROJECT_STATE.md.

---

## 📚 Injeção de Contexto (Context Hydration)

### Knowledge Layer Requerida
* [architecture-principles.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/architecture-principles.md)

### Rules Requeridas
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md)
* [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)

### Runtime Context (Arquivos Carregados)
* Mapeamento de dependências conceituais da Work Unit ativa.

---

## ⚙️ Configurações de Toolchain
Esta Capability atua exclusivamente no processamento e filtragem textual de arquivos, **não acionando compiladores ou linters locais**.

---

## 🚫 Restrições de Escopo (Fronteiras)
* **Não altera arquivos de código:** O Context Builder apenas lê arquivos para compor o payload; ele é proibido de editar ou criar arquivos no repositório.
* **Não executa Work Units:** A execução técnica de escrita de código é de responsabilidade única da Execution Engine.
* **Não toma decisões lógicas de negócio:** O escopo de negócio é lido de forma passiva dos arquivos de especificação.

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* Montagem de payload de contexto respeitando o limite máximo de tokens estabelecido (budget de contexto).
* Exclusão absoluta de qualquer documento proibido (*Forbidden Context*) declarado pela Capability.
* Inclusão correta dos arquivos de código-fonte mapeados de forma minimalista.

### Critérios de Falha
* Carregamento indiscriminado de arquivos do framework (ex: ler arquivos de backend para tarefas de frontend).
* Payload contendo dependências circulares de arquivos.
* Ultrapassar o limite de orçamento de contexto (*Context Budget*).
