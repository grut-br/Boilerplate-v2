# Exemplo Real de Utilização: Documentation Capability

Este documento apresenta um exemplo prático completo de execução da **Documentation Capability** no pipeline da Framework Engine V3.0, demonstrando a transformação de uma Specification de entrada em um documento técnico estruturado final.

---

## 🗺️ Cenário de Execução
* **Objetivo:** Gerar o `README.md` explicativo para o componente de formulário [BaseInput](file:///C:/Users/lucas/Projetos/Boilerplate-v2/src/components/forms/BaseInput.tsx) (fictício), detalhando suas propriedades e requisitos de acessibilidade (A11y).
* **Work Unit ID:** `WU-023`
* **Transação:** `tx_doc_example_001`

---

## 1. Specification de Entrada (Input)
O arquivo de especificação abaixo foi criado pelo Control Plane em `.ai-workspace/specifications/base-input-doc.md`:

```markdown
# Specification: Documentação do Componente BaseInput

## Objetivo
Gerar o guia técnico de uso para o componente `BaseInput` localizado em `src/components/forms/BaseInput.tsx`.

## Requisitos de Conteúdo
1. Descrição clara do propósito do componente.
2. Tabela com as propriedades do componente (Props).
3. Exemplo prático de importação e uso.
4. Checklist detalhado de acessibilidade (A11y), com foco em atributos ARIA e tags de formulário acessível.

## Restrições
Não adicionar placeholders e usar links clicáveis clicáveis (file://).
```

---

## 2. Injeção de Contexto (Context Hydration)
O **Context Builder** lê as dependências e monta o seguinte conjunto de informações para o prompt cognitivo:

* **Mandatory (Obrigatório):**
  * `.agents/rules/always-read.md`
  * `DOCUMENTATION_GUIDELINES.md`
* **Optional (Opcional):**
  * `src/components/forms/BaseInput.tsx` (apenas assinaturas e tipos para leitura passiva)
* **Forbidden (Proibido):**
  * Restante do diretório `src/` e arquivos `.json` de configuração.

---

## 3. Payload do Runtime State
A transação é inicializada na memória operacional com a seguinte carga útil:

```json
{
  "transactionId": "tx_doc_example_001",
  "workUnit": {
    "id": "WU-023",
    "domain": "documentation",
    "title": "Gerar README do componente BaseInput"
  },
  "runtimeInputs": {
    "targetFilePath": "C:/Users/lucas/Projetos/Boilerplate-v2/src/components/forms/README.md",
    "specificationSource": "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/base-input-doc.md"
  }
}
```

---

## 4. Prompt Assembly & Execução
A **Execution Engine** unifica o contexto e dispara a escrita física no arquivo de destino. Como a capability é a `v3-capability-documentation`, ela está bloqueada de interagir com o terminal e alterar arquivos de código. Ela grava diretamente a saída em Markdown no arquivo especificado.

---

## 5. Documento Técnico Produzido (Output)
Abaixo está o conteúdo gerado no arquivo `src/components/forms/README.md` pela Capability:

```markdown
# Componente: BaseInput

O `BaseInput` é um componente estrutural de formulário desenvolvido para o ecossistema do Next.js e Tailwind CSS. Seu principal objetivo é encapsular a lógica de renderização de inputs nativos do HTML, garantindo a associação automática de labels e o tratamento nativo de estados de erro acessíveis (A11y).

---

## 🛠️ Propriedades (Props)

O componente aceita as seguintes propriedades tipadas:

| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Sim | Identificador único para vinculação semântica do label. |
| `label` | `string` | Sim | Texto visível exibido acima do input. |
| `name` | `string` | Sim | Nome do campo enviado na submissão do formulário. |
| `type` | `"text" | "email" | "password" | "number"` | Não (Default: `"text"`) | Tipo do input HTML. |
| `error` | `string` | Não | Mensagem de erro que ativa o estado inválido do campo. |

---

## 💻 Exemplo de Uso

```tsx
import { BaseInput } from "./BaseInput";

export function LoginForm() {
  return (
    <form className="space-y-4">
      <BaseInput
        id="email-field"
        name="email"
        type="email"
        label="Endereço de E-mail"
        error={undefined}
      />
    </form>
  );
}
```

---

## ♿ Diretrizes de Acessibilidade (A11y)

Para cumprir as regras do [a11y-micro-acessibilidade/SKILL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/skills/a11y-micro-acessibilidade/SKILL.md), o componente implementa:
* **Vinculação Label-Input:** Uso do atributo `htmlFor` no `<label>` correspondente ao `id` do `<input>`.
* **Aria-Invalid:** O atributo `aria-invalid={!!error}` é injetado dinamicamente para anunciar erros aos leitores de tela.
* **Aria-Describedby:** Se houver um erro, o input recebe `aria-describedby={`${id}-error`}` vinculando-o à mensagem de erro.
```

---

## 6. Validação e Fechamento
1. **Toolchain Gateway:** O validador local de caminhos analisa o arquivo gerado e confirma que o link para a skill de acessibilidade [a11y-micro-acessibilidade/SKILL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/skills/a11y-micro-acessibilidade/SKILL.md) está correto e aponta para um arquivo físico existente. O linter de markdown retorna `PASS`.
2. **Result Processor:** Consolida a transação, marca a Work Unit `WU-023` como concluída no `PROJECT_STATE.md` e encerra a memória do Runtime State.
