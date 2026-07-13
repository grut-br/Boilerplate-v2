# Especificação de Runtime de Execução (Execution Runtime) — V3.0

Este documento define oficialmente a especificação de montagem dinâmica de instruções da **Execution Engine** em tempo de execução, detalhando a arquitetura de prompts e o controle de entropia cognitiva.

---

## ⚡ Prompt Assembly Pipeline (Pipeline de Montagem de Prompt)

O pipeline de montagem e conversão de dados do repositório em uma instrução final semântica para a IDE segue o seguinte fluxo linear de 9 etapas de processamento:

```text
Work Unit (ID + Passos)
   │
   ├──> 1. Carrega a Capability de Escrita correspondente
   │
   ├──> 2. Aciona o Context Builder (Localiza regras e arquivos físicos)
   │
   ├──> 3. Hidratação do Contexto (Filtra dados redundantes e compacta o payload)
   │
   ├──> 4. Execution Engine (Monta a estrutura de prompt unificada)
   │
   ├──> 5. Prompt Final (Entrega a instrução estruturada determinística)
   │
   ├──> 6. IDE (Gera comandos físicos de edição e escrita no repositório)
   │
   ├──> 7. Resposta (Captura o código escrito localmente nos arquivos)
   │
   ├──> 8. Toolchain (Executa lint, compilação de build e testes)
   │
   └──> 9. Runtime State (Consolida a Work Unit no PROJECT_STATE.md)
```

---

## 🧠 Controle de Baixa Entropia e Prevenção de Contradições

Para mitigar a alucinação e garantir foco cognitivo absoluto da IA durante a escrita de código, a Execution Engine aplica três diretivas lógicas de baixa entropia:

1. **Assinatura Estrita de Cabeçalho (Header Anchoring):** O prompt final começa injetando obrigatoriamente a regra absoluta [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md). Isso garante que os pesos do modelo dêem prioridade máxima às restrições do framework antes de ler o código.
2. **Eliminação de Regras Contraditórias:** O Context Builder impede a inclusão simultânea de regras conceituais concorrentes. Por exemplo, se a Capability ativa é `write-ui`, o Builder oculta qualquer diretiva de segurança de banco de dados (`security.md`) ou processamento de lote, prevenindo ruído semântico.
3. **Isolamento de Responsabilidade Territorial:** O prompt declara de forma explícita quais arquivos a IA tem autorização física para ler e escrever (*Allowed Side Effects*). O motor local de execução integrado à IDE monitora e barra qualquer tentativa de tocar em outros diretórios, mantendo o processo seguro.
4. **Resumos de Contexto (Context Summarization):** Arquivos conceituais da Knowledge Layer não são injetados por completo. O Builder extrai resumos ou tópicos isolados pertinentes à tarefa, mantendo a latência e o consumo de tokens mínimos.
