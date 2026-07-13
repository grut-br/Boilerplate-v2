# Especificação de Hidratação de Contexto (Context Hydration) — V3.0

Este documento define a especificação conceitual da **Context Hydration** (Hidratação de Contexto) no AI Development Framework V3.0. A hidratação de contexto é a técnica de montagem dinâmica e sob demanda das informações fornecidas à inteligência artificial a cada ciclo de execução.

---

## 💧 O que é Context Hydration

**Context Hydration** é o processo pelo qual a Framework Engine localiza, extrai e compila dinamicamente apenas a fração mínima necessária de regras, diretrizes, definições de design e código-fonte relevante para alimentar a execução de uma tarefa específica. Em vez de ler diretórios inteiros, a Engine "hidrata" o contexto da IA com dados precisos.

## 🎯 Por que ela existe

Nos modelos tradicionais de desenvolvimento assistido por IA, os agentes tendem a ler todos os guias, papéis, regras e arquivos de código do projeto a cada turno. Isso causa dois problemas graves:
1. **Context Bloat (Sobrecarga de Contexto):** A injeção de dados irrelevantes satura o contexto de memória da IA, causando perda de atenção cognitiva, alucinações e erros sintáticos.
2. **Latência e Custo Elevados:** O processamento redundante de milhares de tokens inibe a velocidade de resposta e eleva os custos operacionais de chamadas às APIs das redes neurais.

A Context Hydration existe para garantir que a IA mantenha **foco absoluto** na tarefa atual com o menor volume possível de dados.

---

## ⚡ Como Reduz o Consumo de Tokens e Impede o Context Bloat

A hidratação dinâmica atua em três níveis de filtragem lógica:

1. **Escopo Arquitetural:** Em vez de carregar todas as bases de conhecimento (ex: segurança, performance, UX, SEO), o sistema de hidratação identifica a natureza da tarefa (ex: "Visual Interface") e carrega estritamente a diretriz correspondente (ex: `ui.md`).
2. **Resolução de Grafo de Código:** Apenas os arquivos físicos que serão editados e seus arquivos de interface diretamente importados são carregados. O restante do repositório é ocultado.
3. **Decapitação de Histórico:** O Context Builder resume o histórico de turnos anteriores da conversa e injeta somente os inputs recentes, prevenindo o crescimento infinito do buffer de chat.

---

## 🔍 Como Decide Quais Documentos Carregar

A decisão de carregamento é tomada através de uma matriz de associação semântica:

```text
Entrada da Tarefa (Ex: Criar Card de Botão)
   │
   ├──> Classificação do Escopo: "UI/Presentation"
   │       └──> Injeta: rules/coding-style.md + knowledge/ui.md
   │
   ├──> Mapeamento de Dependências de Código:
   │       └──> Injeta: src/components/ui/button.tsx
   │
   └──> Regra de Ancoragem Absoluta (Sempre presente):
           └──> Injeta: rules/always-read.md
```

* **Always Read:** A regra de conduta inegociável ([always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md)) é injetada em 100% dos fluxos.
* **Association Rules:** Se o Control Plane identifica escrita em banco, associa a capacidade de dados e as regras de persistência. Se identifica escrita visual, associa regras de CSS e acessibilidade.

---

## 🔄 Substituição da Leitura Indiscriminada

Na versão V2, a IA dependia da leitura visual do mapa estático `FRAMEWORK_INDEX.md` para decidir voluntariamente o que ler. Na versão V3, este processo passa a ser **automatizado e forçado pelo Context Builder**. A IA não precisa escolher quais guias carregar; ela recebe um payload já filtrado, limpo e estruturado para execução imediata. Isso transforma o framework em uma ferramenta leve, escalável e adequada ao uso diário em larga escala.
