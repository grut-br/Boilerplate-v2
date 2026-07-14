# Guia de Atualização e Migração — UPGRADE

Este guia auxilia a migração de projetos criados sob as especificações da versão **V3.1** ou anteriores para a nova arquitetura estável da **Devio Platform V4.0.0**.

---

## 1. Atualização do Gerenciador de Pacotes (PNPM)
A V4.0.0 adota formalmente o **pnpm** como gerenciador de pacotes oficial do repositório para velocidade de instalação e compartilhamento de dependências locais:
1. Certifique-se de ter o pnpm instalado globalmente em sua máquina (`npm i -g pnpm`).
2. Delete arquivos de trava antigos (como `package-lock.json` ou `yarn.lock`) do seu projeto legado.
3. Garanta a presença do arquivo de configuração `pnpm-lock.yaml` e execute:
   ```bash
   pnpm install
   ```

---

## 2. Injeção da Engine de Contexto (V4)
Para migrar a subestrutura cognitiva e diagnósticos da Engine V3.1 para a V4.0.0:
1. Copie o diretório `framework-engine/` completo da raiz do template Boilerplate V4 para a raiz do seu projeto antigo.
2. Certifique-se de que os scripts de teste e typecheck do `package.json` principal foram atualizados para incluir as suítes de testes globais do framework:
   ```json
   "scripts": {
     "test": "node --experimental-strip-types --test framework-engine/src/cli/CLI.test.ts",
     "typecheck": "tsc --noEmit"
   }
   ```
3. Se seu projeto antigo possuía um arquivo de grafo customizado, configure sua localização inicial no arquivo `framework-engine/src/config/` ou instancie o `GraphifyKnowledgeProvider` passando o caminho explícito do `graphLocation` nas propriedades do construtor.

---

## 3. Substituição do Prompt Assembly Antigo
Se o seu código legado interagia diretamente com a antiga classe de hidratação ou montagem conceitual de prompts:
1. Substitua as instâncias pelo novo resolvedor unificado `PromptAssembler` (disponível em `framework-engine/src/prompt/PromptAssembler.ts`).
2. Atualize o mapeamento de seções de prompts de strings soltas para a interface de objetos tipados `PromptSection`.
3. Garanta a instanciação do `PromptBudget` passando o limite útil de tokens aceito pelo seu modelo LLM atual, ativando a poda inteligente automática em cenários de estouro de tamanho de payloads.

---

## 4. Integração do Watcher de Sincronização Lazy
Para projetos grandes que sofrem com lentidão e leitura de estados fantasmas (Ghost States):
1. Substitua os mocks e stubs de processos em produção no seu arquivo de configuração local habilitando o transporte real `spawn`.
2. Configure as opções do watcher `RealGraphWatcher` nas propriedades de inicialização do provider para monitorar o workspace de código.
3. Sempre que submeter buscas à Engine no seu servidor back-end, certifique-se de que a chamada ao resolvedor aguarda a checagem lazy de desvios do watcher no disco, sincronizando alterações pendentes de forma automática.
