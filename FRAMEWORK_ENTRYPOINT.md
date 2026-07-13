# Ponto de Entrada do Framework (Framework Entry Point) — V3.0

Este documento estabelece a interface operacional e pública única para inicialização, execução e conclusão de tarefas na **Framework Engine V3.0**. Qualquer desenvolvedor humano ou agente de IA que interaja com este repositório deve obrigatoriamente adotar as diretrizes deste ponto de entrada.

---

## 🎯 Objetivo
Padronizar a esteira de desenvolvimento de software assistido por IA, garantindo que toda modificação física de código-fonte seja validada de forma determinística por linters e compiladores locais, isolada em transações na memória RAM operacional e registrada no histórico do projeto sem concorrência ou Context Drift.

---

## ⚡ Fluxo Operacional Simplificado

A execução da Framework segue a esteira contínua abaixo:

```
[Especificação] ➔ [Planejador] ➔ [Seleção] ➔ [Hidratação] ➔ [Escrita] ➔ [Validação] ➔ [Consolidação]
```

---

## 📋 Pré-requisitos de Execução

Antes de disparar qualquer execução na Engine, garanta que:
1.  **Specification Ativa:** Exista um arquivo Markdown contendo os requisitos de negócio salvos em `.ai-workspace/specifications/` (ex: `feature-x.md`).
2.  **Estado Limpo:** O arquivo [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md) esteja sincronizado com a branch ativa no Git.
3.  **Toolchain Local Operacional:** A IDE física possua os compiladores (`tsc`) e linters (`next lint`) configurados localmente no computador do usuário.

---

## 🧭 Pipeline Completo e Estados Operacionais

Durante o ciclo de processamento, a Engine transiciona entre os seguintes estados lógicos:

| Estado | Descrição da Ação | Módulo Responsável |
| :--- | :--- | :--- |
| **IDLE** | Engine aguardando entrada de novas especificações. | Control Plane |
| **PLANNING** | Decomposição da especificação de entrada em Work Units. | `v3-capability-planning` |
| **LOADING** | parsing de metadados e acoplamento da capability ideal. | `v3-capability-loader` |
| **HYDRATING** | Injeção tardia de regras e contexto limitado em tokens. | `v3-capability-context-builder` |
| **EXECUTING** | Edição e gravação física de código-fonte no repositório. | `v3-capability-execution-engine` |
| **VALIDATING** | Testes estáticos, de tipos e de regressão local na toolchain. | `v3-capability-toolchain-gateway` |
| **CONSOLIDATING**| Consolidação do log e promoção de estado no histórico. | `v3-capability-result-processor` |
| **DISPOSED** | Purgamento seguro do buffer cognitivo de RAM operacional. | `v3-capability-runtime-state` |

---

## 📥 Entradas Aceitas
*   **Specifications:** Arquivos Markdown em `.ai-workspace/specifications/`.
*   **Work Units:** Arquivos individuais estruturados baseados no template oficial [work-unit-template-v3.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/work-unit-template-v3.md).

---

## 📤 Saídas Esperadas
*   **Código-Fonte Validado:** Alterações aplicadas na pasta `src/` que compilam e passam nos testes locais com sucesso.
*   **Histórico de Estado de Longo Prazo:** Atualizações de progresso consolidadas no [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md).
*   **Log Estático:** Relatórios estruturados das sprints gerados em `.ai-workspace/logs/`.

---

## ⚠️ Erros Operacionais e Recuperação

### 1. Falha de Compilação Física (Lints/Tipagem)
*   *Causa:* A Execution Engine escreveu código com erros sintáticos.
*   *Recuperação (Self-Healing):* O Toolchain Gateway envia o log de erros refinado de volta à Execution Engine para uma retentativa de correção. Se falhar após 3 tentativas, o Result Processor executa o **Rollback Físico** (git checkout do arquivo íntegro anterior), trava o pipeline e atualiza o estado da Work Unit para `Failed`.

### 2. Violação de Escopo Territorial (Forbidden Context)
*   *Causa:* A Capability tentou gravar código fora dos caminhos lógicos autorizados ou acessou arquivos proibidos (como segredos e credenciais).
*   *Recuperação:* O pipeline é interrompido instantaneamente por ação de **Abort**. A transação é descartada e o incidente é gravado nos relatórios de auditoria, exigindo intervenção manual de um desenvolvedor humano.

---

## 🏁 Finalização da Execução
Toda transação bem-sucedida ou com falha persistente deve obrigatoriamente invocar o método de descarte de estado temporário no `Runtime State` (limpeza completa do buffer de memória do prompt da IA). Isso garante que o próximo ciclo comece 100% livre de vazamento de conceitos e informações retroativas (*Context Drift*).
