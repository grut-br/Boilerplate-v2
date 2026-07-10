# Acessibilidade Digital (Accessibility - A11y)

Este documento define os princípios operacionais para assegurar que o software seja utilizável por qualquer indivíduo, incluindo pessoas com deficiências visuais, motoras, cognitivas ou auditivas. A acessibilidade deve ser integrada à lógica semântica da aplicação.

## ♿ Princípios de Acessibilidade

### 1. Semântica Estrutural Nativa
* Use elementos nativos correspondentes ao significado real do conteúdo (ex: use botões para ações, links para navegação e tags de layout estrutural para divisões lógicas).
* A marcação semântica garante que leitores de tela entendam o propósito e o comportamento da interface sem necessidade de artifícios adicionais.

### 2. Navegabilidade e Controle de Foco por Teclado
* Toda e qualquer ação disponível na interface deve ser totalmente acessível através do teclado.
* **Gerenciamento de Foco:** O indicador visual de foco deve ser sempre visível e fluir em ordem lógica de leitura. Modais e popups devem aprisionar o foco do teclado internamente até serem fechados (focus trapping).

### 3. Uso Correto de Atributos ARIA (Accessible Rich Internet Applications)
* Use atributos ARIA para enriquecer e prover acessibilidade a elementos altamente dinâmicos onde a estrutura nativa é insuficiente.
* **Regra de Ouro:** Não use ARIA a menos que seja estritamente necessário. Prefira sempre elementos nativos semânticos.
* Atualize estados dinâmicos (como erros, expansões e abas) via atributos de estado apropriados (`aria-invalid`, `aria-expanded`, `aria-describedby`).

### 4. Acessibilidade Visual e Contraste
* Garanta contraste de cor suficiente entre o texto e seu fundo para ser legível sob diversas condições de iluminação.
* O design e os textos devem ser legíveis mesmo quando o tamanho da fonte da janela do navegador é ampliado em até 200%.

### 5. Acessibilidade em Formulários
* Todo campo de entrada deve estar explicitamente vinculado a um rótulo legível (Label).
* Erros de validação de formulários devem ser anunciados de forma clara e automática por leitores de tela, vinculando a mensagem de erro diretamente ao input correspondente.
