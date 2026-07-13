# Manual do Toolchain Gateway — AI Development Framework V3.0

Este documento define a especificação oficial e o manual do **Toolchain Gateway** da versão 3.0 do framework. O Toolchain Gateway é o validador físico determinístico responsável por garantir a integridade do repositório local após qualquer ciclo de modificação.

---

## 🎯 Objetivo

O objetivo do Toolchain Gateway é separar completamente a cognição generativa da IA das validações determinísticas de engenharia. A IA escreve o código com base em probabilidades semânticas, mas o Toolchain Gateway avalia o código sob regras físicas estritas (compiladores, linters e testes locais), blindando o repositório contra bugs sintáticos ou regressões.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Receber da Execution Engine o relatório de arquivos físicos modificados.
* Executar o **Validation Pipeline** (esteira sequencial de testes locais e compilação).
* Capturar, analisar e filtrar logs brutos emitidos pelos validadores do repositório.
* Traduzir erros sintáticos e falhas em relatórios estruturados legíveis para a IA.
* Acionar a estratégia de reversão automática de código (Rollback) caso alguma etapa obrigatória de compilação falhe.

### Ferramentas Suportadas
* **TypeScript Compiler (`tsc`):** Validação estrita de tipagem estática.
* **Next.js Builder (`next build`):** Verificação completa da integridade do build de produção e rotas.
* **ESLint (`next lint`):** Verificação de regras de formatação e boas práticas estáticas de React.
* **Playwright/Jest (`npm test`):** Testes funcionais e unitários de regressão de tela.

### Entradas (Inputs)
* Lista de arquivos alterados e criados.
* Comando de execução e regras de validação associadas ao escopo da tarefa.

### Saídas (Outputs)
* Relatório estruturado de validação contendo status de aprovação (`PASS` / `FAIL`).
* Logs de erros refinados (apenas linhas e erros relevantes) em caso de falha.
* Confirmação de consolidação ou reversão de estado.

---

## 🚧 Limites e Estratégia de Validação

### Limites
* **Sem cognição de código:** O Toolchain Gateway não analisa o estilo visual das páginas ou as decisões arquiteturais; seu escopo de avaliação é estritamente booleano (compila ou não compila, passa nos testes ou não passa).
* **Dependência do Terminal:** A validação ocorre localmente através de comandos reais disparados via subprocessos locais no ambiente do usuário.

### Estratégia de Validação
O Gateway opera sob a estratégia de **Validação Progressiva e Falha Rápida (Fail-Fast)**. As validações menos custosas rodam primeiro (ex: linting e checagem de tipos), enquanto etapas complexas de cobertura de testes rodam apenas se o código estiver 100% livre de erros sintáticos.

---

## 🚫 Casos Inválidos (Erros de Bloqueio)

O Toolchain Gateway abortará imediatamente o ciclo de escrita se:
* A ferramenta local requerida (ex: `next`) não estiver instalada ou configurada no diretório.
* O build estático retornar códigos de saída (`exit codes`) diferentes de zero.
* O processo de auditoria detectar que a Execution Engine tentou desabilitar ou ignorar regras do ESLint (ex: injetar blocos `// eslint-disable-next-line` indiscriminados para burlar o validador).
