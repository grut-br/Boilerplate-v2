# Capability: Toolchain Gateway (v3-capability-toolchain-gateway)

Esta Capability define a especificação de controle e análise técnica de auditoria da Framework Engine. Ela é responsável por interagir diretamente com linters, compiladores e testadores locais para auditar modificações.

---

## 🎯 Objetivo
Garantir e certificar a integridade técnica das alterações propostas por IAs no código do repositório antes de autorizar a consolidação final das tarefas.

---

## 🛠️ Escopo Operacional

### Inputs
* Lista física de arquivos criados, modificados ou removidos.
* Regras de validação técnica da Capability de escrita ativa.
* Comandos locais de terminal configurados para execução.

### Outputs
* Relatório estruturado em JSON com resultados booleanos de compilação, linting e testes.
* Comando de rollback estruturado (caso ocorram erros de compilação).

### Runtime
* A Capability atua após o encerramento do processamento de escrita pela Execution Engine, servindo como o funil que decide a transição de estado da Work Unit.

---

## ⚙️ Estratégia de Validação e Limites

### Estratégia
* **Fail-Fast sequencial:** Executa os testes em cascata, abortando a compilação no primeiro validador local que acusar erros.
* **Filtro de Logs:** Exclui avisos genéricos (`warnings`) irrelevantes de dependências terceiras, focando a entrega de logs apenas nos trechos de código modificados pela tarefa para evitar poluição do prompt.

### Limites
* Não altera arquivos de configuração globais.
* Não executa scripts remotos ou comandos externos que exijam acesso à rede pública.
* Não tenta propor códigos de correção em arquivos fonte.

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* Passar 100% livre de erros no ESLint (`next lint`).
* Passar 100% livre de erros no compilador TypeScript (`tsc --noEmit`).
* Sucesso na execução do build estático de produção do Next.js (`next build`).
* Execução e aprovação completa de testes unitários ou de integração associados à alteração.

### Critérios de Falha
* Qualquer código de saída diferente de zero (`exit code 1`) retornado pelos subprocessos locais.
* Modificação não-autorizada em arquivos de configuração que desabilite as regras de verificação.
* Travamento (timeout) na execução de testes locais de cobertura de tela.
