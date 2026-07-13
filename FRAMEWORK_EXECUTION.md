# Manual Operacional da Execution Engine — AI Development Framework V3.0

Este documento define a especificação oficial e o manual operacional da **Execution Engine** da versão 3.0 do framework. A Execution Engine é o motor central encarregado de traduzir a Work Unit atômica e o contexto hidratado em um payload final de instrução semântica para qualquer agente ou IDE.

---

## 🎯 Objetivo

O objetivo da Execution Engine é servir de ponte definitiva entre o framework documental e a IDE física do desenvolvedor, gerando instruções estritas e determinísticas que digam à IA exatamente **o que alterar, sob quais regras, e onde**, blindando o código contra alterações indevidas ou fora de escopo.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Receber a Work Unit ativa e o payload de contexto hidratado pelo Context Builder.
* Executar o **Prompt Assembly Pipeline** (montagem final do prompt de execução).
* Formatar e traduzir as instruções técnicas da Capability para a assinatura de ferramentas nativas da IDE (ex: Cursor, Windsurf, Antigravity CLI).
* Garantir baixa entropia eliminando redundâncias e instruções conflitantes do prompt final.
* Isolar o escopo de escrita, bloqueando edições físicas fora dos caminhos autorizados da Work Unit.

### Pipeline de Execução
1. **Consumo:** Abertura da Work Unit, Capability e Contexto.
2. **Montagem (Prompt Assembly):** Junção linear das diretrizes absolutas, regras de codificação, especificações e arquivos de código.
3. **Conversão de IDE:** Formatação de instruções estruturadas compatíveis com o agente integrado.
4. **Execução:** Gravação física das mudanças no código-fonte local do repositório.
5. **Gateway de Validação:** Envio do código resultante para compilação local no Toolchain Gateway.

### Entradas (Inputs)
* Work Unit ativa com metadados detalhados.
* Context Payload (Arquivos estritamente necessários montados pelo Context Builder).
* A Capability ativada com seus critérios e restrições.

### Saídas (Outputs)
* Código-fonte fisicamente editado e gravado no repositório local.
* Logs de execução e status para o Result Processor.

---

## 🚧 Limites e Garantias

### Limites
* **Sem Planejamento:** A Execution Engine não toma decisões de roadmap, não divide tarefas e não interage com o Chat Externo; seu foco é unicamente na micro-escrita do código da Work Unit ativa.
* **Sem Decisões de Arquitetura:** Ela segue estritamente as especificações lidas. Se faltar definição arquitetural, a Engine suspende a execução e repassa a tarefa de volta ao Control Plane.

### Garantias
* **Foco Estrito de Arquivos:** Proibida de criar ou alterar arquivos fora do caminho (*Allowed Side Effects*) declarado na Capability.
* **Integridade Sintática:** Nenhuma linha de código é mantida se a compilação local falhar (Rollback Automático).

---

## 🚫 Casos Inválidos (Erros de Bloqueio)

A Execution Engine rejeitará a tarefa imediatamente se:
* O payload de contexto hidratado não contiver o arquivo de regra inegociável `rules/always-read.md`.
* O plano de escrita tentar modificar simultaneamente múltiplos Route Groups ou fatias diferentes de Feature-Sliced Design (FSD).
* A instrução final do prompt contiver contradições de estilo (ex: misturar sintaxe de componentes legados com Tailwind v4).
