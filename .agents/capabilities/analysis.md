# Capability: Analysis (v3-capability-analysis)

| Metadado | Descrição / Valor |
| :--- | :--- |
| **Capability Name** | `v3-capability-analysis` |
| **Category** | `Plugin Capability` |
| **Supported Domains** | `["analysis", "audits", "reports", "code-reviews"]` |
| **Supported Task Types** | `["code-analysis", "static-review", "documentation-audit"]` |
| **Inputs** | `["specifications", "code-files", "rules", "decisions"]` |
| **Outputs** | `["analysis-reports", "audit-logs"]` |
| **Required Context** | `["rules/always-read.md", "DEVELOPMENT_GUIDE.md"]` |
| **Optional Context** | `["PROJECT_STATE.md", "FRAMEWORK_INDEX.md"]` |
| **Execution Limits** | Proibido escrever ou editar código em `src/`, modificar arquivos de configuração ou executar comandos de sistema. Apenas realiza auditorias e emite relatórios. |
| **Success Conditions** | Emite relatórios válidos em markdown analisando o código de forma passiva, sem alterações físicas. |
| **Failure Conditions** | Qualquer tentativa de escrita em `src/` ou execução de subprocessos de terminal. |

---

## 🎯 Objetivo
Realizar análise lógica e estrutural passiva de arquivos de código-fonte, especificações ou documentações do repositório, emitindo relatórios de auditoria detalhados sobre conformidade de regras e arquitetura, sem aplicar modificações sintáticas ou executar comandos de infraestrutura.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Analisar passivamente arquivos de código e documentação no repositório.
* Identificar falhas de nomenclatura, violações de diretrizes de FSD e acoplamentos indevidos.
* Avaliar o cumprimento de regras de acessibilidade e performance visual com base na Knowledge Layer.
* Gerar relatórios de conformidade e auditoria estruturada no formato Markdown (.md).

### Entradas (Inputs)
* ID da Work Unit e escopo do alvo a ser analisado.
* Códigos-fonte alvo em `src/` (carregados estritamente como leitura passiva).
* Diretrizes do framework em `.agents/rules/` e skills locais.

### Saídas (Outputs)
* Relatório técnico de auditoria salvo em `.ai-workspace/logs/` ou caminho configurado.
* Status final do julgamento da análise (`PASS` / `FAIL`) gravado no Runtime State.

---

## 🚫 Restrições e Limites (Fronteiras)
* **Proibido Alterar Código:** Não cria, edita ou exclui nenhum arquivo fora de documentação e logs. A pasta `src/` está blindada contra escrita.
* **Proibido Executar Comandos:** Não possui permissão para rodar linters físicos ou compiladores no terminal do desenvolvedor.
* **Isolamento Cognitivo:** A capacidade opera de forma descartável, expurgando as assinaturas lidas ao encerrar seu turno.

---

## 💾 Diretrizes de Memória e Escopo (Runtime)

*   **Owner (Proprietário):** Engine Core (Execution Engine).
*   **Execution Scope:** Escrita restrita a relatórios e logs em subpastas de `.ai-workspace/` e documentações.
*   **Validation Commands:** Nenhum comando de terminal física. A validação do arquivo de log Markdown é feita pela checagem de links do Toolchain Gateway.
*   **Maximum Context (Tokens):** Teto máximo de `10.000` tokens de buffer hidratado.
*   **Runtime Budget:** Limite de tempo de processamento cognitivo otimizado.

---

## 📦 Exemplo de Payload de Runtime

```json
{
  "transactionId": "tx_analysis_plugin_99",
  "workUnit": {
    "id": "WU-025",
    "domain": "analysis",
    "title": "Auditar conformidade de FSD no módulo Auth"
  },
  "runtimeInputs": {
    "targetFilePath": "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/logs/auth-fsd-audit.md",
    "codeFilesToRead": [
      "C:/Users/lucas/Projetos/Boilerplate-v2/src/features/auth/actions.ts"
    ]
  },
  "runtimeOutputs": {
    "status": "SUCCESS",
    "writtenFiles": [
      "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/logs/auth-fsd-audit.md"
    ]
  }
}
```
