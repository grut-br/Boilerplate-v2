# Os Porquês da Arquitetura — WHY

Este documento detalha as motivações técnicas e de negócios que estruturam as escolhas arquiteturais da **Devio Platform V4** e sua **Knowledge Engine**.

---

## 🧠 Decisões do Back-end / AI Context Engine

### 1. Por que existe a `KnowledgeEngine`?
* **Problema:** Enviar toda a base de código (ou arquivos aleatórios) para o LLM gera alto custo financeiro, estouro de janelas de contexto e alucinações devido a excesso de dados irrelevantes.
* **Solução:** Um motor cognitivo unificado que planeja a busca, resolve dependências, comprime redundâncias e monta prompts otimizados.
* **Benefício:** Reduções drásticas no consumo de tokens e aumento exponencial na assertividade do modelo.

### 2. Por que o `Graphify`?
* **Problema:** Buscas textuais simples (grep/busca semântica comum) falham em mapear relacionamentos hierárquicos e acoplamentos entre classes e arquivos de código.
* **Solução:** Compilação do workspace em um grafo de dependências da AST (`graph.json`) relacionando declarações de símbolos, imports e chamadas.
* **Benefício:** Localização rápida de impactos de alterações em toda a árvore de dependências.

### 3. Por que o `MCP` (Model Context Protocol)?
* **Problema:** Desenvolver um barramento de comunicação acoplado e proprietário para cada ferramenta de IA que a agência viesse a adotar.
* **Solução:** Adoção do protocolo padronizado da Anthropic (MCP) via subprocessos spawnados se comunicando em JSON-RPC.
* **Benefício:** Arquitetura 100% expansível, permitindo acoplar novos servidores de IA ou ferramentas sob um padrão universal.

### 4. Por que o `GraphManager` & `GraphProcessManager`?
* **Problema:** Risco de "Ghost State" (consultar o grafo desatualizado após alterações no disco pelo desenvolvedor/agente).
* **Solução:** Gerenciamento ativo do ciclo de vida do servidor MCP associado ao watcher de FS events nativo para re-compilar/sincronizar de forma lazy o grafo antes de qualquer busca.
* **Benefício:** Garantia de consistência e leitura sempre íntegra em tempo real.

### 5. Por que o `Semantic Cache`?
* **Problema:** Consultas repetidas ou muito semelhantes custavam tempo de processamento e re-processamento inútil do grafo.
* **Solução:** Cache semântico em memória que armazena resultados e avalia a similaridade de cosseno de novas buscas.
* **Benefício:** Respostas instantâneas em 9ms para buscas repetidas (economia de 57% de latência).

### 6. Por que o `Query Planner`?
* **Problema:** Queries complexas enviadas à Engine falham ao tentar resolver tudo de uma única vez em um único bloco.
* **Solução:** Motor de planejamento descentralizado que compila a busca em uma árvore de subqueries prioritárias ordenadas por tags e capabilities.
* **Benefício:** Consultas estruturadas com estimativa de custos e sem travamentos por recursividade circular.

### 7. Por que a `Context Compression`?
* **Problema:** Documentos e códigos possuem comentários, quebras de linhas repetidas e trechos redundantes que inflam o payload de contexto.
* **Solução:** Compressor determinístico em memória que normaliza espaçamentos, remove duplicidades (via MD5/SHA) e classifica a relevância por tags.
* **Benefício:** Reduções lineares de até **96.70% de tokens** mantendo a legibilidade funcional.

### 8. Por que a `AST Projection`?
* **Problema:** Carregar e ler um arquivo gigante contendo milhares de linhas para entender apenas um único método acoplado.
* **Solução:** Projeção cirúrgica de nós da AST baseando-se em profundidade configurada (depth de arestas).
* **Benefício:** Envio apenas das assinaturas de classes e dependências úteis da AST necessárias para resolver o problema de código.

---

## 🎨 Decisões de Arquitetura Frontend (`src/`)

### 9. Por que usar `Ports & Adapters` (Arquitetura Hexagonal)?
* **Problema:** Acoplamento de infraestruturas voláteis (APIs de provedores de IA ou Supabase) diretamente no core lógico da aplicação.
* **Solução:** Definição de portas abstratas de comunicação (interfaces) e acoplamento de adaptadores concretos separados.
* **Benefício:** Liberdade para trocar o provedor de IA ou de banco sem alterar uma única linha de regras de negócio.

### 10. Por que `FSD` (Feature-Sliced Design)?
* **Problema:** Pastas tradicionais por tipos de arquivos (`components/`, `hooks/`) tornam-se caóticas e difíceis de manter em projetos de larga escala.
* **Solução:** Divisão da aplicação por fatias funcionais de negócios modulares em `src/features/[feature-name]/` (contendo seus próprios componentes, schemas e Server Actions de forma autocontida).
* **Benefício:** Isolamento completo de bugs e facilidade para reaproveitar módulos funcionais entre diferentes projetos.

### 11. Por que `Route Groups` do Next.js?
* **Problema:** Repetir a importação de estruturas comuns de layout (Header, Footer, Sidebar) e controle de acesso em todas as páginas do projeto.
* **Solução:** Agrupamento lógico de rotas sem afetar a URL física (`(marketing)`, `(app)`, `(auth)`), injetando layouts globais e middlewares de segurança dedicados a cada grupo.
* **Benefício:** Aplicação 100% DRY (Don't Repeat Yourself) e controle centralizado e infalível de acessos e permissões.
