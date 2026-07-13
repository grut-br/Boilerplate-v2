# Especificação de Work Unit — V3.0

Este documento define oficialmente o conceito, estrutura e ciclo de vida de uma **Work Unit** (Unidade de Trabalho) no AI Development Framework V3.0. A Work Unit é o bloco fundamental de execução técnica da Framework Engine.

---

## 🎯 Objetivo

O objetivo de uma Work Unit é isolar a complexidade técnica de desenvolvimento em uma alteração atômica e de responsabilidade única. Ela garante que a Execution Engine trabalhe focada em um escopo extremamente reduzido por vez, minimizando o risco de erros de renderização, regressões lógicas ou conflitos de mesclagem.

---

## 📏 Tamanho Ideal

Uma Work Unit de tamanho ideal deve ser executável de forma isolada em um único turno de IA (uma única resposta/tool call). 
* **Escopo temporal sugerido:** Equivale a uma alteração que leva de 5 a 15 minutos para um desenvolvedor humano sênior codificar.
* **Escopo físico sugerido:** Modificar ou criar entre 1 e 3 arquivos no repositório.

---

## 📐 Estrutura de uma Work Unit

Toda Work Unit gerada pelo planejamento deve conter:

1. **ID:** Identificador exclusivo sequencial (ex: `WU-01`, `WU-02`).
2. **Nome:** Título autoexplicativo (ex: "Criar formulário de contato").
3. **Capability Recomendada:** Indicação da capacidade a ser acoplada (ex: `v3-capability-ui`).
4. **Entradas (Inputs):** Arquivo de especificação específico e arquivos de código existentes a serem editados.
5. **Critério de Aceitação:** Regra explícita de funcionamento da tarefa.
6. **Saídas (Outputs):** Listagem de arquivos modificados ou criados.
7. **Validação Necessária:** Testes ou comandos locais da toolchain requeridos para homologação da unidade.

---

## 🔄 Regras de Divisão e União

### Quando Dividir uma Work Unit:
* A tarefa envolve modificações simultâneas de frontend (interface visual) e backend (banco de dados/actions).
* A alteração afeta mais de um Route Group ou mais de uma fatia de Feature (FSD).
* A execução necessita de mais de um tipo de Capability (ex: precisa escrever estilos e configurar uma política RLS).
* O plano de testes locais exige dados de semente (seed) complexos.

### Quando Unir Work Units:
* A tarefa é estritamente cosmética (ex: alterar a cor de múltiplos botões globais ou corrigir copys de texto).
* As tarefas dependem exatamente do mesmo arquivo de contexto e seriam bloqueadas caso fossem executadas de forma concorrente.
* A separação causaria erros de compilação temporários (estado instável do repositório).

---

## 📝 Exemplos Práticos

### Exemplo 1: Correta decomposição de uma Feature (Cadastro de Aluno)
* **WU-01:** `v3-capability-persistence` | Criar tabela `alunos` no banco de dados e políticas RLS.
* **WU-02:** `v3-capability-logic` | Implementar Server Action de validação de input de alunos com Zod.
* **WU-03:** `v3-capability-ui` | Construir componente de formulário com estados de carregamento e foco acessível.
* **WU-04:** `v3-capability-ui` | Renderizar formulário na subpágina `/cadastro`.

### Exemplo 2: Work Unit incorreta (Context Bloat / Over-scoped)
* **ID:** `WU-01`
* **Descrição:** Criar tabela alunos no banco, configurar rotas, escrever layout da página e adicionar estilo glow no botão de salvar.
* **Erro:** Agrupa infraestrutura de banco, lógica de servidor, e apresentação de layout sob a mesma tarefa, resultando em leitura massiva de código e risco de alucinação de escopo.
