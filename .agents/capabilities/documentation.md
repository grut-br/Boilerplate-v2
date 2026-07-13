# Capability: Documentation (v3-capability-documentation)

| Metadado | Descrição / Valor |
| :--- | :--- |
| **Capability Name** | `v3-capability-documentation` |
| **Supported Domains** | `["documentation", "specifications", "adr", "logs", "readmes"]` |
| **Supported Task Types** | `["technical-writing", "specification-to-doc", "changelog-generation", "api-documentation"]` |
| **Inputs** | `["specifications", "decisions (ADRs)", "code-signatures", "framework-index"]` |
| **Outputs** | `["documentation-files", "markdown-artifacts"]` |
| **Required Context** | `["rules/always-read.md", "DOCUMENTATION_GUIDELINES.md"]` |
| **Optional Context** | `["PROJECT_STATE.md", "FRAMEWORK_INDEX.md"]` |
| **Execution Limits** | Proibido escrever, editar ou refatorar código em `src/` ou rodar comandos de sistema. Apenas escrita de documentação. |
| **Success Conditions** | Produz sintaxe Markdown válida, alinha-se com especificações sem placeholders e respeita as fronteiras documentais. |
| **Failure Conditions** | Tentativa de escrita ou edição de código em `src/`, execução de comandos de terminal, ou seções incompletas. |

---

## 🎯 Objetivo
Produzir documentação técnica padronizada a partir de especificações de features e metadados de projeto, operando exclusivamente na camada de documentação do repositório, garantindo o isolamento total do código-fonte e o cumprimento das regras estruturais do framework.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Interpretar [Specifications](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/) e gerar manuais técnicos de fácil compreensão para engenheiros humanos e outros agentes de IA.
* Elaborar e atualizar arquivos README para detalhar o escopo e uso de componentes e módulos do sistema.
* Registrar decisões de arquitetura e design no formato de [Architectural Decision Records (ADRs)](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/decisions/).
* Gerar logs cronológicos de desenvolvimento e changelogs em `.ai-workspace/logs/` a partir do fechamento de tarefas.
* Manter a integridade de referências cruzadas usando obrigatoriamente links markdown no esquema `file://`.

### Entradas (Inputs)
* Specification de entrada localizada em `.ai-workspace/specifications/` (ex: `documentation-capability.md`).
* Decisões arquiteturais associadas contidas em `.ai-workspace/decisions/` (ADRs).
* Histórico de Work Units e Snapshot operacional presentes em [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md).
* Assinaturas de interfaces de código exportadas da Execution Engine (apenas para referência de escrita, de forma passiva).

### Saídas (Outputs)
* Arquivos físicos estruturados em Markdown (.md) contendo manuais, guias, changelogs ou relatórios.
* Atualização do catálogo de caminhos em [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md).

### Dependências
* Specifications, [DOCUMENTATION_GUIDELINES.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DOCUMENTATION_GUIDELINES.md) e [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md).

---

## 🚫 Restrições de Escopo (Fronteiras)
* **Proibido Alterar Código:** Não pode criar, editar ou apagar arquivos com extensões de código (ex: `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.json`) na pasta `src/` ou em qualquer diretório de lógica do framework.
* **Proibido Executar Comandos:** Não possui permissão para rodar comandos de compilação, testes, linters ou scripts no terminal do desenvolvedor (`Execution Engine` e `Toolchain Gateway` gerenciam subprocessos se houver, mas para esta capability, nenhum comando é permitido).
* **Ausência de Papéis lúdicos:** Age exclusivamente como uma interface funcional, sem assumir personalidades de equipe (como Manager, Frontend Developer, etc.).

---

## 📚 Injeção de Contexto (Context Hydration)

### Contexto Obrigatório (Mandatory Context)
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) (Ancoragem absoluta de conduta).
* [DOCUMENTATION_GUIDELINES.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DOCUMENTATION_GUIDELINES.md) (Diretrizes de documentação e ownership).

### Contexto Opcional (Optional Context)
* [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md) (Contexto sobre a Work Unit corrente).
* [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md) (Consulta de mapeamentos conceituais).

### Contexto Proibido (Forbidden Context)
* Código-fonte físico localizado na pasta `src/` (exceto quando assinaturas de tipos ou declarações de componentes forem explicitamente necessárias como referência passiva para a redação da documentação).
* Arquivos de configuração crítica de infraestrutura (ex: `package.json`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`).

---

## 💾 Memória Volátil (Runtime State)

### Runtime Inputs
* `WorkUnitId`: O identificador da tarefa de documentação em execução (ex: `WU-022`).
* `TargetFilePath`: O caminho absoluto do arquivo markdown a ser criado ou atualizado.
* `SpecificationSource`: O arquivo de origem das especificações de negócios e requisitos técnicos.

### Runtime Outputs
* `Status`: Resultado da operação (sucesso ou falha).
* `WrittenFiles`: Lista de caminhos de arquivos criados ou modificados.
* `ContextBudgetUsed`: Número total de tokens consumidos durante o turno de injeção de contexto.

---

## ⚙️ Configurações de Toolchain

### Validation Commands
Esta Capability não interage diretamente com ferramentas de compilação física ou linters de código do repositório. A validação documental é gerenciada de forma assíncrona pelo Toolchain Gateway, focando estritamente em:
1. **Validação de Sintaxe Markdown:** Auditoria automática da formatação usando linters de markdown (se configurados, ex: `markdownlint`).
2. **Validação de Links:** Verificação de que todos os links declarados com o protocolo `file://` apontam para caminhos físicos existentes.

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* O artefato produzido reflete integralmente os requisitos declarados na Specification de origem.
* O arquivo de saída possui formatação em markdown limpa, livre de erros de renderização e seguindo as regras de microcopy e clareza do [ux-writing/SKILL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/skills/ux-writing/SKILL.md).
* Todos os caminhos de arquivos referenciados utilizam links clicáveis formatados como `[nome-do-arquivo](file:///caminho/absoluto)`.
* Zero alterações foram aplicadas sobre arquivos de código-fonte no diretório `src/`.

### Critérios de Falha
* Qualquer tentativa de escrita ou modificação em arquivos do diretório `src/`.
* Presença de placeholders, marcações inacabadas ("TODO", "TBD", "Lorem Ipsum") ou parágrafos redundantes e prolixos.
* Quebra estrutural na sintaxe markdown que impeça a leitura legível por leitores de tela ou renderizadores locais.

---

## 🔄 Exemplo de Execução (Payload e Fluxo)

```json
{
  "transaction_id": "tx_doc_998822",
  "capability": "v3-capability-documentation",
  "work_unit": {
    "id": "WU-022",
    "title": "Documentar a Primeira Capability Operacional",
    "domain": "documentation"
  },
  "runtime_inputs": {
    "target_file": "C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/documentation.md",
    "source_specification": "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/documentation-capability.md"
  },
  "runtime_outputs": {
    "status": "SUCCESS",
    "written_files": [
      "C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/documentation.md"
    ],
    "validation": {
      "markdown_lint": "PASS",
      "broken_links_check": "PASS"
    }
  }
}
```
