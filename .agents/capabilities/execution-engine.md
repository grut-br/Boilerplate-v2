# Capability: Execution Engine (v3-capability-execution-engine)

Esta Capability define a especificação conceitual do motor de escrita de código-fonte. Ela é a inteligência técnica principal encarregada de interagir com o sistema de arquivos para realizar edições lógicas e visuais orientadas pelas demais Capabilities de escrita.

---

## 🎯 Objetivo
Transformar payloads de contexto hidratado e planos de tarefas em modificações de arquivos físicos consistentes e limpas sob o Feature-Sliced Design e Tailwind v4.

---

## 🛠️ Escopo Operacional

### Inputs
* Plano de passos técnicos da Work Unit ativa.
* Contexto hidratado (regras de estilo, guias técnicos e arquivos de código existentes).
* Capability de escrita ativa carregada na memória.

### Outputs
* Arquivos físicos editados, excluídos ou criados na estrutura local.
* Status da compilação e logs de execução emitidos.

### Runtime
* A Capability reside em memória unicamente durante o ciclo operacional de modificação de arquivos, sendo purgada logo após a auditoria do Result Processor.

---

## 📚 Injeção de Contexto (Context Hydration)

### Contexto Obrigatório (Mandatory)
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md)
* [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md)
* [architecture.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/architecture.md)

### Contexto Proibido (Forbidden)
* Arquivos conceituais de planejamento macro (`roadmap/`).
* Logs de Work Units antigas finalizadas.
* Biblioteca de Skills inativas no catálogo.

---

## ⚙️ Estratégia de Execução

1. **Leitura e Mapeamento:** Identifica a Capability de escrita carregada (ex: `write-ui`) e mapeia suas restrições e regras estritas.
2. **Edição Focada:** Inicia a alteração física de arquivos de forma incremental (Baby Steps), tocando apenas os arquivos autorizados pelo escopo de efeitos colaterais permitidos (*Allowed Side Effects*).
3. **Auditoria Imediata:** Invoca o Toolchain Gateway local de forma síncrona para analisar o código escrito após cada modificação importante.

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* Modificação correta e limpa dos arquivos autorizados no repositório.
* Ausência absoluta de erros de compilação no compilador do Next.js ou TypeScript.
* Conformidade 100% com o guia do `coding-style.md`.

### Critérios de Falha
* Erro apontado pelo linter (`eslint`) ou falha de build estático local (`next build`).
* Modificação ou criação de arquivos fora da lista de caminhos declarada na Work Unit.
* Introdução de importações circulares ou violações de isolamento de Route Groups.
