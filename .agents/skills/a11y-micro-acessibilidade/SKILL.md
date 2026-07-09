---
name: a11y-micro-acessibilidade
description: Diretrizes estritas e regras de micro-acessibilidade (A11y) para garantir navegação por teclado fluida, semântica correta do HTML5, e compatibilidade universal com leitores de tela (NVDA, JAWS, VoiceOver) em projetos Next.js e Tailwind CSS.
metadata:
  author: antigravity
  version: "1.0.0"
---

# Acessibilidade Universal e Micro-Acessibilidade (A11y)

Este documento estabelece os padrões e regras estritas para a implementação de interfaces 100% acessíveis e semânticas de acordo com as especificações WCAG 2.2 (Níveis AA e AAA) utilizando React, Next.js e Tailwind CSS.

---

## 🎯 Diretrizes Principais
- **Navegabilidade por Teclado**: Todo fluxo interativo deve ser totalmente operacional usando apenas a tecla `Tab`, `Enter`, `Space` e setas direcionais.
- **Leitores de Tela (Screen Readers)**: Toda ação ou estado de componente deve ser explicitamente anunciado para o usuário (suporte completo a NVDA, JAWS e VoiceOver).
- **Semântica Estrutural**: O código React deve produzir um documento HTML semanticamente coerente, limpo e estruturado.

---

## 🛑 Regras Rígidas de Implementação

### 1. Semântica HTML5 Estrita
É **terminantemente proibido** atribuir manipuladores de evento interativos (como `onClick`, `onKeyDown`, etc.) a elementos nativos não interativos (como `div`, `span`, `section`, `p`).

#### Diretrizes Obrigatórias:
* **Botões vs Links**:
  - Se a interação realiza uma ação na página atual (submeter form, abrir modal, disparar requisição, alternar estado), utilize `<button>`.
  - Se a interação direciona o usuário para outra rota ou âncora de página, utilize o componente `<Link>` do `next/link`.
* **Proibição de Pseudo-Botões**: Não simule botões com `<div onClick={...}>`. Além de quebrar a navegação por teclado, leitores de tela ignoram a interatividade do elemento, gerando uma barreira intransponível para usuários cegos ou com baixa visão.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Quebra semântica, foco por teclado e acessibilidade por leitores de tela
export function BadButton({ onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer bg-blue-500 text-white p-2">
      Enviar Form
    </div>
  );
}
```

#### Exemplo Correto:
```tsx
import Link from 'next/link';

// ✅ Botão de ação semântico e focável por padrão
export function GoodButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg transition-colors hover:bg-primary/90"
    >
      Enviar Form
    </button>
  );
}

// ✅ Navegação semântica interna com Next.js
export function NavigationLink() {
  return (
    <Link 
      href="/dashboard/configuracoes"
      className="text-sm font-semibold text-foreground hover:underline"
    >
      Ir para Configurações
    </Link>
  );
}
```

---

### 2. Gerenciamento de Foco Visual Explícito
Nunca remova o indicador visual de foco (`outline`) sem fornecer uma alternativa esteticamente agradável e claramente visível.

#### Diretrizes Obrigatórias:
* **Foco no Teclado (focus-visible)**: Use sempre a pseudo-classe `:focus-visible` para aplicar estilos de foco que aparecem apenas quando o usuário está navegando via teclado, mantendo o visual limpo para cliques do mouse.
* **Estilo Padrão do Boilerplate**: Use as classes utilitárias do Tailwind CSS baseadas em anéis de foco (`ring`). Recomenda-se: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Esconde o indicador de foco, impossibilitando navegação por teclado
export function InvisibleFocusButton() {
  return (
    <button className="bg-red-500 text-white focus:outline-none">
      Salvar
    </button>
  );
}
```

#### Exemplo Correto:
```tsx
// ✅ Foco visível estético e destacado quando acessado via teclado
export function AccessibleFocusButton() {
  return (
    <button 
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Salvar
    </button>
  );
}
```

---

### 3. Aplicação Correta de Atributos ARIA
Todos os componentes dinâmicos de interface rica devem se autoanunciar corretamente usando a especificação ARIA.

#### Diretrizes Obrigatórias:
* **Botões de Ícone (Sem Texto)**: Devem obrigatoriamente conter um `aria-label` descritivo ou uma tag `<span className="sr-only">`.
* **Componentes Expansíveis (Accordions/Menus)**: O elemento de controle (trigger) deve conter `aria-expanded="true"` ou `aria-expanded="false"` dinamicamente atualizado pelo estado do React, além do atributo `aria-controls` apontando para o `id` do painel que está sendo controlado.
* **Componentes Compostos (Tabs/Comboboxes)**: Siga o padrão WAI-ARIA Authoring Practices (APG), garantindo os papéis (`role="tablist"`, `role="tab"`, etc.) e estados corretos.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Leitores de tela lerão apenas "Botão" ou o nome do ícone, sem contexto da ação
export function CloseIconButton() {
  return (
    <button onClick={() => {}}>
      <XIcon />
    </button>
  );
}
```

#### Exemplo Correto:
```tsx
import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

// ✅ Botão de ícone com descrição clara para leitores de tela
export function CloseIconButton({ onClose }: { onClose: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClose}
      aria-label="Fechar painel de detalhes"
      className="p-2 text-muted-foreground hover:text-foreground rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <X className="w-5 h-5" />
    </button>
  );
}

// ✅ Accordion dinâmico com controle ARIA completo
export function AccessibleAccordionItem({ title, content, id }: { title: string, content: string, id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `panel-${id}`;
  const triggerId = `trigger-${id}`;

  return (
    <div className="border-b">
      <h3>
        <button
          id={triggerId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex justify-between w-full py-4 text-left font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span>{title}</span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="pb-4 text-muted-foreground transition-all duration-200"
      >
        {content}
      </div>
    </div>
  );
}
```

---

### 4. Hierarquia Lógica de Cabeçalhos
A estrutura de títulos da página deve formar um índice/esquema lógico legível.

#### Diretrizes Obrigatórias:
* **Um H1 por Página**: Deve haver exclusivamente um único elemento `<h1>` por página (representando a informação principal do documento).
* **Níveis Consecutivos (Sem saltos)**: Não pule níveis de cabeçalhos de forma descendente (ex: ir de `<h2>` para `<h4>` sem utilizar um `<h3>`).
* **Estilo vs Semântica**: Nunca mude a tag de cabeçalho apenas para obter um tamanho visual diferente. Sempre utilize a tag semanticamente correta para o esquema da página e ajuste a escala visual utilizando as classes do Tailwind CSS (`text-sm`, `text-lg`, `text-3xl`, etc.).

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Causa confusão no índice gerado para leitores de tela
export function BadHero() {
  return (
    <div>
      <h1>Título da Landing Page</h1>
      {/* Saltou direto para H4 apenas por causa do tamanho visual pequeno */}
      <h4>Subtítulo da Seção</h4> 
    </div>
  );
}
```

#### Exemplo Correto:
```tsx
// ✅ Estrutura semântica correta com estilos aplicados pelo Tailwind
export function GoodHero() {
  return (
    <header className="space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
        Título da Landing Page
      </h1>
      <h2 className="text-lg font-medium text-muted-foreground md:text-xl">
        Subtítulo complementar da seção
      </h2>
    </header>
  );
}
```

---

## 🛠️ Checklist do Agente de IA para Acessibilidade (A11y)
Sempre que criar ou editar interfaces e componentes, certifique-se de satisfazer os seguintes critérios:

1. **[ ]** Todos os elementos clicáveis usam `<button>` (ações) ou `<Link>` (navegação)?
2. **[ ]** Há algum manipulador `onClick` em `div`, `span`, `li` ou `p`? Se sim, altere para `<button>` ou adicione `role="button"`, `tabIndex={0}` e suporte a eventos de teclado (`onKeyDown` para Enter/Space). Preferencialmente, converta para `<button>`.
3. **[ ]** Botões que renderizam apenas ícones têm `aria-label` contendo texto inteligível?
4. **[ ]** Todos os elementos interativos possuem o estilo `:focus-visible` definido e visível?
5. **[ ]** A hierarquia dos títulos da página (`h1`, `h2`, `h3`...) é contínua e lógica? Há apenas um `h1` na página?
6. **[ ]** Accordions, modais e submenus gerenciam os estados `aria-expanded`, `aria-hidden`, `aria-modal` e `aria-controls` adequadamente?
