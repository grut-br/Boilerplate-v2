# Especificação de Consolidação de Resultados (Result Processing) — V3.0

Este documento define oficialmente a especificação de consolidação de execuções do **Result Processor** em tempo de execução, detalhando o pipeline de tomada de decisão e arquivamento de estados de longo prazo.

---

## ⚡ Result Processing Pipeline (Pipeline de Processamento)

O processamento e a transição lógica do ciclo de desenvolvimento ocorrem sob o seguinte fluxo de processamento integrado:

```text
Inputs (Runtime State + Toolchain Result + Execution Result)
   │
   ├──> 1. Triagem e Processamento de Logs pelo Result Processor
   │
   ├──> 2. Decisão de Ação (Aplica regras de julgamento)
   │         │
   │         ├──> Success  ──> Atualiza PROJECT_STATE.md, Logs, ADRs e libera Próxima Work Unit
   │         ├──> Retry    ──> Reenvia relatório de erros para nova escrita da Execution Engine
   │         ├──> Rollback ──> Restaura repositório e descarta memória temporária do Runtime
   │         └──> Abort    ──> Congela a esteira de execução e alerta o Desenvolvedor Humano
```

---

## 🧭 Lógica de Tomada de Decisão (Decision Tree)

O Result Processor avalia as variáveis operacionais com base nas seguintes condições:

### 1. Critérios de Sucesso (Success)
* **Condição:** O Toolchain Gateway retornou aprovação de build, lint e testes (`PASS` / exit code 0).
* **Ações:**
  * **Atualizar PROJECT_STATE.md:** Grava a Work Unit ativa no histórico de concluídas.
  * **Registrar Logs:** Copia o snapshot final do Runtime State para `.ai-workspace/logs/` com data e metadados.
  * **Gravar ADRs:** Caso a Work Unit seja de natureza estrutural e tenha introduzido novas diretrizes arquiteturais homologadas.
  * **Next Work Unit:** Emite autorização para o Control Plane liberar a execução da próxima tarefa.

### 2. Critérios de Retentativa (Retry)
* **Condição:** O Toolchain Gateway retornou erro de compilação ou lint (`FAIL`), mas o número de retentativas executadas é menor do que 3.
* **Ações:** O Processor mantém o Runtime State ativo, incrementa o contador de retentativas, filtra os logs de erro brutos e solicita que a Execution Engine realize a autocorreção (*Self-Healing*).

### 3. Critérios de Reversão (Rollback)
* **Condição:** O Toolchain retornou falhas persistentes após 3 retentativas ou ocorreu erro crítico que impossibilite o build estático.
* **Ações:**
  * Dispara comando de descarte de modificações de código (Git checkout).
  * Limpa a memória operacional do Runtime State.
  * Notifica o Control Plane para suspender o avanço da sprint, exigindo análise de planejamento.

### 4. Critérios de Aborto (Abort)
* **Condição:** Ocorreu erro de integridade de contexto, tentativa de alteração fora do escopo de caminhos autorizados da Work Unit, ou falha crítica de leitura física.
* **Ações:** Paralisa completamente o pipeline de execução e solicita intervenção imediata do desenvolvedor humano no terminal, prevenindo corrupção de arquivos.
