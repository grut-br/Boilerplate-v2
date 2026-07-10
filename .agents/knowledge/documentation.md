# Diretrizes de Documentação (Documentation)

Este documento define os princípios conceituais para manter a transparência, histórico e rastreabilidade de código e decisões técnicas no ecossistema do projeto.

## ✍️ Práticas de Documentação

### 1. Código Autoexplicativo
* A primeira camada de documentação é o próprio código. Escolha design semântico e assinaturas de métodos autoexplicativos que dispensem comentários triviais sobre o que a linha realiza (ex: evite documentar `// incrementa count` em um `count++`).

### 2. Documentação como Código (Docs-as-Code)
* Toda documentação estrutural do projeto, guias de desenvolvimento e checklists de conformidade técnica devem residir no controle de versão do repositório, garantindo rastreabilidade histórica e sintonia imediata com o estado de produção.

### 3. Registros de Decisões de Arquitetura (ADR)
* Mudanças fundamentais que alteram o ecossistema técnico do projeto (ex: troca de banco de dados, introdução de nova biblioteca de validação, alteração do padrão de roteamento) devem ser documentadas contendo a data, o contexto, as alternativas avaliadas e a justificativa final da decisão.

### 4. Manutenção Contínua
* Documentação desatualizada é pior do que a ausência dela. Os registros de estado (como o `PROJECT_STATE.md`) devem ser modificados no exato instante em que o status físico das tarefas for alterado na base.
