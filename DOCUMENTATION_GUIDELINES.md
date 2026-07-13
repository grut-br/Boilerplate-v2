# Diretrizes de Documentação (DOCUMENTATION_GUIDELINES) — V3.0

Este documento define oficialmente a política de **Document Ownership** e as **Documentation Layers** da Framework Engine V3.0, garantindo o princípio de *Single Source of Truth* (Fonte Única de Verdade) para toda a base conceitual do repositório.

---

## 🏛️ Documentation Layers (Camadas Documentais)

Toda a documentação do framework é dividida em camadas lógicas estritas com responsabilidades isoladas:

| Camada | Escopo e Responsabilidade | Exemplos |
| :--- | :--- | :--- |
| **Foundation** | Visão conceitual ampla, mapas de navegação e filosofia do ecossistema. | `V3_ARCHITECTURE.md`, `DEVELOPMENT_GUIDE.md`, `FRAMEWORK_INDEX.md` |
| **Modules** | Manuais técnicos exaustivos e operacionais de cada módulo do núcleo. | `FRAMEWORK_EXECUTION.md`, `FRAMEWORK_TOOLCHAIN.md`, `FRAMEWORK_RUNTIME.md`, `FRAMEWORK_RESULT_PROCESSOR.md` |
| **Capabilities** | Arquivos de definição conceitual de habilidades isoladas. | `.agents/capabilities/planning.md`, `.agents/capabilities/context-builder.md` |
| **Contracts** | Estruturas formais e interfaces obrigatórias que toda Capability deve seguir. | `CAPABILITY_CONTRACT.md` |
| **Specifications** | Modelos funcionais de algoritmos, fluxos e resoluções do motor cognitivo. | `.ai-workspace/specifications/work-unit-definition.md` |
| **Runtime Documents** | Relatórios voláteis de monitoramento técnico e snapshots de memória temporária. | Relatórios de execução do `v3-capability-runtime-state` |
| **Templates** | Placeholders e estruturas reutilizáveis para novas capacidades ou planos. | `.ai-workspace/templates/` |
| **Logs** | Histórico temporal do progresso das tarefas de desenvolvimento. | `.ai-workspace/logs/` |
| **Roadmaps** | Planejamento macro de longo prazo do repositório. | `.ai-workspace/roadmap/` |
| **ADRs** | Registros formais de decisões estruturais e desvios de arquitetura. | `.ai-workspace/decisions/` ou registros de decisões |

---

## ⚖️ Política de Document Ownership (Propriedade Documental)

Para evitar duplicidades, contradições e inflação de contexto (*Context Bloat*), a governança documental rege-se pelas seguintes diretrizes inegociáveis:

1. **Fonte Única de Verdade (Single Source of Truth):** Cada conceito deve pertencer a um único documento proprietário.
2. **Sem Duplicidade de Explicação:** Nenhum conceito de engenharia pode ser explicado detalhadamente em mais de um arquivo. Os demais documentos conceituais devem apenas fazer referências cruzadas utilizando links.
3. **Decisões Estruturais via ADR:** Toda e qualquer alteração lógicas em limites, caminhos, escopos territoriais ou regras do framework exige a criação ou atualização de um registro formal de decisão arquitetural (ADR).
4. **Independência da Foundation:** Capabilities operacionais futuras estão proibidas de editar arquivos da camada Foundation.
5. **Especificações Respeitam Contratos:** Specifications da Engine detalham algoritmos de fluxo de processamento, mas **jamais prevalecem ou substituem o contrato de conformidade** (`CAPABILITY_CONTRACT.md`).
6. **Snapshots de Runtime Não Alteram Regras:** Documentos gerados dinamicamente em tempo de execução (Snapshots de memória) são voláteis e nunca substituem regras de Specifications ou Contracts.
7. **Logs Sem Autoridade Arquitetural:** Históricos de progresso e logs gravados após o encerramento do ciclo registram fatos passados, mas nunca possuem autoridade para redefinir as restrições lógicas ativas do framework.
