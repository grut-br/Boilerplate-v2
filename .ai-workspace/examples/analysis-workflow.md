# Simulação de Fluxo Operacional: Analysis Capability

Este documento apresenta a simulação cronológica de execução da **Analysis Capability** (`v3-capability-analysis`) estendida como plugin na Framework Engine V3.0.

---

## 🧭 Etapa 1: Specification (Entrada)
O desenvolvedor insere a solicitação para auditar as Server Actions do módulo de Auth em `.ai-workspace/specifications/auth-actions-audit.md`:

```markdown
# Specification: Auditoria das Server Actions de Autenticação

## Objetivo
Auditar as Server Actions localizadas em `src/features/auth/actions.ts` para verificar conformidade com as regras do [backend-supabase-mastery/SKILL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/skills/backend-supabase-mastery/SKILL.md).

## Requisitos
1. Verificar uso estrito de Zod para validação de formulários.
2. Inspecionar tratamento de erros em Server Actions (retorno de ActionState).
3. Verificar a ativação correta de Row Level Security (RLS) no Supabase.
```

---

## 🛠️ Etapa 2: Planning Capability (Decomposição)
A `v3-capability-planning` decompõe o escopo e gera a Work Unit `WU-027` na pasta `.ai-workspace/specifications/active/wu-027-auth-actions-audit.md`.

---

## 📄 Etapa 3: Work Unit Ativa (WU-027)

```markdown
# Work Unit: Auditoria de Server Actions (WU-027)

* **ID:** `WU-027`
* **Objetivo:** Auditar `src/features/auth/actions.ts` contra Supabase Mastery.
* **Capability Responsável:** `v3-capability-analysis`
* **Complexidade:** Micro Task
* **Status:** Pendente

## 📥 Injeção de Contexto
* **Mandatory:**
  * `.agents/rules/always-read.md`
  * `.agents/skills/backend-supabase-mastery/SKILL.md` (passivo)
* **Passivo (Leitura):**
  * `src/features/auth/actions.ts`

## 📤 Resultados Esperados
* **Arquivo a Criar:**
  * `.ai-workspace/logs/auth-actions-audit-report.md`

## 🏆 Critérios de Aceite
* [ ] Validar conformidade de esquemas Zod.
* [ ] Confirmar assinatura de retorno `ActionState` em todas as actions do arquivo.
```

---

## 🔌 Etapa 4: Capability Loader & Context Builder
O `v3-capability-loader` identifica e acopla a capability `v3-capability-analysis` sem alterar a Engine central. O `Context Builder` realiza a hidratação dos arquivos listados na `WU-027`.

---

## 🔎 Etapa 5: Analysis Capability (Execução Passiva)
A Engine sob a capability `v3-capability-analysis` realiza a inspeção e grava as saídas em `.ai-workspace/logs/auth-actions-audit-report.md`:

```markdown
# Relatório de Auditoria: Server Actions de Autenticação

*   **Arquivo Auditado:** `src/features/auth/actions.ts`
*   **Data:** 2026-07-10
*   **Status de Conformidade:** PASS

---

## 📊 Itens Avaliados

1.  **Validação Zod (Esquemas):**
    *   *Status:* **Conforme**.
    *   *Análise:* O schema `loginSchema` é validado usando `safeParse` antes de instanciar a chamada ao Supabase.
2.  **Assinatura de Retorno (ActionState):**
    *   *Status:* **Conforme**.
    *   *Análise:* Todos os retornos de erro e sucesso utilizam a estrutura genérica `ActionState` em conformidade com as regras de actions.
3.  **Segurança (Supabase SSR):**
    *   *Status:* **Conforme**.
    *   *Análise:* O cliente do servidor Supabase é instanciado de forma assíncrona usando `createClient` importado de `@/lib/supabase/server`.
```

---

## 🏁 Etapa 6: Fechamento (Result Processor)
O Toolchain Gateway valida que o arquivo Markdown gerado não causou alterações em arquivos em `src/`. O Result Processor atualiza o `PROJECT_STATE.md` marcando a `WU-027` como concluída, descarrega a transação e limpa a memória volátil.
