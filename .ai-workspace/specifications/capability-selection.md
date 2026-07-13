# Especificação de Seleção de Capabilities (Capability Selection) — V3.0

Este documento define oficialmente a especificação e as regras do algoritmo conceitual de resolução e seleção de Capabilities da Framework Engine.

---

## 🎯 Assinatura de Metadados da Work Unit

Para que a seleção ocorra de forma determinística, toda Work Unit deve expor as seguintes propriedades estruturadas:

1. **Tipo (Task Type):** Natureza técnica da tarefa (ex: `visual-interface`, `data-persistence`, `logic-action`, `quality-audit`).
2. **Escopo (Scope):** Nível de impacto de modificações no repositório (ex: `local-component`, `global-layout`, `db-schema`).
3. **Complexidade (Complexity):** Nível operacional (ex: `Micro Task`, `Small Feature`, `Feature`).
4. **Domínio (Domain):** Segmento lógico de FSD (ex: `ui`, `server-logic`, `database-model`).
5. **Dependências (Dependencies):** Lista de IDs de Work Units precedentes.
6. **Capability Sugerida (Suggested Capability):** Indicação inicial fornecida pela Planning Capability.

---

## 🧭 Algoritmo de Seleção

O algoritmo conceitual avalia e escolhe a Capability em tempo de execução através das seguintes etapas lineares:

```text
Entrada da Work Unit
   │
   ├──> 1. Validação de Metadados (Interrompe se truncado ou incompleto)
   │
   ├──> 2. Filtro por Domínio Suportado (Supported Domains)
   │
   ├──> 3. Filtro por Tipo de Tarefa Suportada (Supported Task Types)
   │
   └──> 4. Julgamento de Seleção e Resolução de Fallback
```

### 1. Critérios de Prioridade
1. **Correspondência Exata (Exact Match):** A Capability que possui correspondência direta tanto com o *Domain* quanto com o *Task Type* sugerido possui prioridade máxima (1).
2. **Especialização de Domínio (Domain Specialization):** Se não houver correspondência exata, seleciona-se a Capability especialista daquele domínio específico (ex: `write-ui` para qualquer tarefa do domínio `ui`).
3. **Generalista de Execução:** Como última opção viável antes do descarte.

### 2. Mecanismo de Fallback (Recuperação)
Se a Capability selecionada como ideal estiver indisponível ou inacessível no catálogo:
* **Passo 1:** O Loader busca uma Capability irmã de mesmo domínio.
* **Passo 2:** Caso indisponível, delega o escopo para a Capability geral de lógica (`logic-action`).
* **Passo 3:** Em último caso, suspende a execução e emite um alerta de erro estruturado solicitando intervenção manual do desenvolvedor humano.

### 3. Casos Inválidos (Exceções de Bloqueio)
O Loader rejeitará e suspenderá a tarefa caso ocorram:
* **Conflito de Domínio:** Uma Work Unit que declara domínio `ui` (frontend) mas exige alterações de banco de dados no domínio `database`.
* **Escopo Excedente:** Work Unit classificada como `Micro Task` tentando editar arquivos estruturais de ações globais de negócio.
* **Complexidade Truncada:** Work Unit com complexidade marcada como `Epic`. Epics devem ser faturadas pela Planning Capability antes de chegar ao Loader.

---

## 📝 Exemplos de Resolução

### Exemplo 1: Resolução de Escrita Visual
* **Entrada da Work Unit:**
  * Domínio: `ui`
  * Tipo: `visual-interface`
  * Capability Sugerida: `v3-capability-ui`
* **Resolução:** O Loader localiza a capability `v3-capability-ui` que suporta o domínio `ui` e tipo `visual-interface` e acopla o driver na Execution Engine.

### Exemplo 2: Interrupção por Conflito de Escopo
* **Entrada da Work Unit:**
  * Domínio: `ui`
  * Tipo: `data-persistence` (criar tabela de dados)
* **Resolução:** O Loader detecta incompatibilidade de domínio e tipo (tentativa de criar tabela SQL sob o domínio visual), suspendendo a execução imediatamente.
