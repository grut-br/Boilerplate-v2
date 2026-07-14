# Specification: Documentation Capability Pipeline (v3-capability-documentation)

Esta especificação define o pipeline lógico e físico de processamento sequencial de tarefas documentais pela **Documentation Capability** integrada à Framework Engine V3.0.

---

## 🗺️ Visão Geral do Pipeline

O fluxo de processamento é dividido em 5 etapas determinísticas e estanques, sem dependências de papéis de equipes ou interações lúdicas:

```
[Recepção] ➔ [Hydration] ➔ [Renderização] ➔ [Validação] ➔ [Entrega]
```

---

## 1. Recepção (Reception Phase)

A etapa de recepção é responsável por inicializar a transação operacional e verificar a integridade da tarefa designada:

*   **Ação:** O `v3-capability-loader` intercepta a Work Unit atômica ativa emitida pelo Control Plane.
*   **Validação de Metadados:** Verifica se o domínio da Work Unit é estritamente igual a `documentation` e se o `TargetFilePath` está apontando para um arquivo `.md` permitido (fora de `src/`).
*   **Geração de Estado:** O `Runtime State` gera um UUID exclusivo para a transação e define seu estado operacional inicial como `Created`.

---

## 2. Hidratação (Hydration Phase)

A etapa de hidratação reúne as dependências teóricas e regras semanticas necessárias para orientar a escrita:

*   **Ação:** O `Context Builder` executa o algoritmo de Context Hydration.
*   **Resolução de Contexto:** Consulta o [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md) e carrega de forma compulsória no buffer cognitivo os arquivos:
    *   [.agents/rules/always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) (Regras inegociáveis).
    *   [DOCUMENTATION_GUIDELINES.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/guides/DOCUMENTATION_GUIDELINES.md) (Normas de escrita e ownership).
*   **Isolamento Estrito:** Garante que a pasta `src/` e arquivos confidenciais do banco de dados (Supabase) ou chaves estejam declarados como *Forbidden Context* e expurgados do payload.

---

## 3. Renderização (Rendering Phase)

A etapa de renderização executa o Prompt Assembly Pipeline e grava o documento físico de destino:

*   **Ação:** A `Execution Engine` processa o prompt e aplica a renderização lógica do texto no arquivo especificado.
*   **Regras de Estilo e Microcopy:** A geração deve seguir as diretrizes do [ux-writing/SKILL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/skills/ux-writing/SKILL.md) (frases curtas, voz ativa, títulos semânticos e sem placeholders).
*   **Gravação Física:** O arquivo Markdown correspondente é escrito no repositório de forma transacional.

---

## 4. Validação (Validation Phase)

A etapa de validação física afere a integridade técnica da documentação gerada:

*   **Ação:** O `Toolchain Gateway` assume a transação e executa as rotinas automáticas de validação documental.
*   **Validação de Sintaxe:** Analisa a estrutura física do Markdown, garantindo conformidade com o padrão GitHub Flavored Markdown (GFM).
*   **Validação de Links:** Varre o documento gerado e valida se todos os links markdown que utilizam o protocolo local (`file:///...`) apontam para arquivos reais existentes no repositório local do desenvolvedor.
*   **Relatório:** Emite um status final de validação (`PASS` ou `FAIL`) e armazena os logs de erros caso ocorram.

---

## 5. Entrega (Delivery Phase)

A etapa de entrega consolida o progresso operacional de longo prazo e limpa a memória temporária:

*   **Ação:** O `Result Processor` analisa o status recebido da Toolchain.
*   **Consolidação de Sucesso:**
    *   Marca a Work Unit ativa como concluída no [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/history/PROJECT_STATE.md).
    *   Adiciona a nova rota ou arquivo gerado no [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md).
    *   Salva o relatório da transação em `.ai-workspace/logs/`.
*   **Limpeza e Purga:** Invoca o descarte da memória volátil no `Runtime State`, liberando o motor de execução para a próxima tarefa.
