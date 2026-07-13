# Specification: Analysis Capability Pipeline (v3-capability-analysis)

Esta especificação detalha o pipeline operacional e de processamento de tempo de execução da **Analysis Capability** operando como uma Plugin Capability estendida na Framework Engine V3.0.

---

## 🗺️ Fluxo de Processamento de Análise

O ciclo de vida de processamento de tarefas de auditoria pela capability segue a esteira sequencial descrita abaixo:

```
[Input] ➔ [Hydration] ➔ [Analysis] ➔ [Output] ➔ [Validation]
```

---

## 1. Input (Recepção)
*   **Descrição:** O `v3-capability-loader` intercepta a Work Unit atômica ativa contendo o domínio `analysis`.
*   **Parâmetros de Entrada:** A Work Unit especifica a lista de arquivos do projeto a serem auditados (ex: arquivos de persistência ou UI) e o caminho físico do relatório final (`TargetFilePath`).

---

## 2. Hydration (Hidratação)
*   **Descrição:** O `Context Builder` injeta passivamente o escopo do prompt.
*   **Carga Útil:**
    *   **Regras Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md) (para servir de critério de auditoria de código).
    *   **Arquivos Alvo:** Arquivos lógicos a serem inspecionados (ex: `src/features/auth/actions.ts`), carregados exclusivamente em modo de **leitura estrita**.
    *   **Contexto Proibido:** Permissões de escrita e ferramentas do terminal.

---

## 3. Analysis (Processamento Cognitivo)
*   **Descrição:** A Engine cognitiva executa a leitura analítica dos arquivos hidratados no prompt.
*   **Análise Lógica:**
    *   Checagem de conformidade com o Feature-Sliced Design (FSD).
    *   Inspeção de tipagem estática e assinaturas de métodos.
    *   Detecção de vazamento de contexto, violações de segurança e uso de placeholders.

---

## 4. Output (Gravação)
*   **Descrição:** A Execution Engine gera o relatório técnico final formatado em Markdown (.md).
*   **Local de Destino:** O arquivo é gravado na pasta `.ai-workspace/logs/` ou em subpastas autorizadas (ex: `C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/logs/auth-fsd-audit.md`).
*   **Gravação do Status:** A transação é definida como `Completed` no buffer temporário de RAM do `Runtime State`.

---

## 5. Validation (Auditoria Física)
*   **Descrição:** O `Toolchain Gateway` analisa o arquivo gerado.
*   **Validações efetuadas:**
    *   Integridade de sintaxe Markdown e ausência de placeholders.
    *   Auditoria territorial: Garante que zero arquivos foram modificados ou criados na pasta `src/` ou em arquivos de configuração do ecossistema.
    *   Se alguma violação territorial ou alteração sintática em código for detectada, o Result Processor aciona `Abort` imediato.
