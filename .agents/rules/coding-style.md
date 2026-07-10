# Padrões e Estilos de Código (Coding Style)

Este documento dita as normas e convenções estruturais que guiam a produção do nosso código. Seguir estes padrões de forma impecável é indispensável para a manutenção de legibilidade superior, clareza no code review, diminuição de dívida técnica e para garantir o intercâmbio rápido de contexto entre as inteligências artificiais e a engenharia de software humana.

## 🔤 Nomenclatura (Naming Conventions)

* **Arquivos e Pastas:** Utilize sempre `kebab-case` para maximizar a compatibilidade de sistemas operacionais. Exemplo: `user-profile.ts`, `login-form.tsx`, `components/ui`.
* **Componentes React / Classes:** Declare utilizando `PascalCase`. Exemplo: `export function LoginForm() {}`, `class ApiClient {}`.
* **Funções e Variáveis Instanciadas:** Utilize exclusivamente `camelCase`. Exemplo: `handleSubmit`, `userData`, `fetchProducts()`.
* **Constantes e Variáveis de Ambiente:** Utilize letras maiúsculas em `UPPER_SNAKE_CASE`. Exemplo: `MAX_REQUEST_RETRIES`, `NEXT_PUBLIC_API_URL`.
* **Tipagens e Interfaces (TypeScript):** Utilize `PascalCase` sem adicionar prefixos antiquados como "I" ou "T". O próprio escopo declara a responsabilidade. Exemplo: `User`, `AuthResponse` em preferência a `IUser`.

## 🏗 Estrutura e Organização de Arquivos

* **Ordem Padronizada de Imports:** Os imports devem seguir um fluxo de precedência de distância conceitual:
  1. Framework e Bibliotecas Core (ex: `react`, `next`, dependências padrão da plataforma).
  2. Pacotes npm de terceiros (ex: `framer-motion`, `zod`).
  3. Imports absolutos do repositório (ex: `@/lib/utils`, `@/components/ui/button`).
  4. Arquivos e módulos estritamente locais com paths relativos (ex: `./types.ts`, `../styles.css`).
* **Estilo de Exportação:** As exportações devem ser essencialmente nomeadas (`export function X`), permitindo auto-completes otimizados e refatorações de código precisas na IDE, abrindo mão do default export (`export default X`) e retendo a utilização do default **apenas** quando for um requesito inegociável da arquitetura do framework web (ex: `page.tsx` ou `layout.tsx`).
* **Legibilidade e Fracionamento Modular:** Funções contendo dezenas de argumentos lógicos ou arquivos excedendo dimensões colossais (e.g. >250 linhas) perdem objetividade. Todo código denso e complexo deve ser reavaliado, decomposto em utilitários menores, menores contextos isolados de negócios (KISS/SRP) ou extração segura em ganchos e blocos customizados.

## ⚛️ React, Framework Web e TypeScript

* **SSR Default e Limites do "use client":** Presuma que todo e qualquer bloco operacional é renderizado pelo Servidor. Atributos em escopo de rede fechada e Server Components são mandatórios por padrão. As marcações diretas de `"use client"` devem ser adiadas e postas na extremidade (folhas) das árvores domíniais, inseridas unicamente onde eventos DOM diretos ou reatividades profundas stateful (`useState`, `useEffect`) imperarem urgência real.
* **Rigor do TypeScript:** Descarte por completo declarações explícitas ou silenciadores providos pelo tipo genérico e leniente `any`. Force inferências ricas do fluxo de código do ambiente, valide interfaces ou empregue inferência em tipagem estática providenciada pela estrutura via schemas de terceiros (como utilitários `z.infer` no Zod).
* **Camadas Isoladas (Server Actions):**
  * Todas as actions devem estampar no topo de suas escopos a provisão `"use server"`.
  * Toda ação assíncrona deve envolver sua emissão estrutural no envelope normalizado de resposta de infra (ex: `ActionState<T>`), despachando flags claras como `success`, `message`, `data` ou listagem iterável no campo `errors` aos clients.
  * O servidor deve adotar try/catch defensivo contra o driver do banco e assegurar a triagem e sanitização mandatória dos schemas enviados na porta de entrada da action.

## 🎨 Estilização Front-end Otimizada

* Utilize unicamente os utilitários de construção modular providenciados (Tailwind CSS) diretamente nos retornos renderizados pelas tags, primando pela sintaxe em classes declarativas (Utility-First).
* Evite poluir os repositórios globais (`globals.css`) para injetar lógicas locais base. As regras restritas desse ambiente devem servir apenas como variáveis dinâmicas em raiz e redefinição (CSS Resets) elementar global ou para famílias tipográficas mestres.
* Priorize agrupamentos eficientes na formatação de arrays dinâmicos de classes, usando processadores dedicados (e.g., `clsx` atrelado ao combinador `tailwind-merge`) para blindar especificidade inconsistente através da função normalizadora `cn()`.

## 💬 Comentários e Documentação Interpretável

* **Auto-Documentação pelo Design Funcional:** O código diz a máquina "o que" necessita ser feito. Uma nomenclatura cirúrgica diminui imensamente qualquer dependência de explanações adicionais descritivas no código vivo.
* **Diga o "Porquê":** Intervenções manuais comentadas existem tão somente para detalhar "porque" algo bizarro está ali. Justifique débitos provisórios, *hacks* atrelados aos ecossistemas terceiros mal otimizados, limitação imperiosa de browsers arcaicos e nuances contraintuitivas nas lógicas de domínio super-rígido.
* **JSDoc/TSDoc Aplicado:** Serviços robustos de terceiros, endpoints críticos expostos de banco e super-utilitários globais precisam de contratos e escopos visíveis no sistema e IDE. Implementar JSDoc/TSDoc na declaração do método engrandece a precisão e velocidade nos fluxos diários do desenvolvedor e das inteligências.
