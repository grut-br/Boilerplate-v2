# Modelagem de Regras de Negócio (Business Rules)

Este documento estabelece as diretrizes para o isolamento e gerenciamento das regras de negócio que ditam o funcionamento real de qualquer aplicação desenvolvida sobre o framework.

## 💼 Conceitos de Regra de Negócio

### 1. Isolamento das Regras Corporativas
* As regras de negócio representam os algoritmos, cálculos, restrições e fluxos de decisão que existiriam na empresa mesmo se o software não existisse (ex: "clientes inadimplentes não podem comprar").
* Essas lógicas nunca devem residir em botões visuais, interceptadores HTTP ou lógicas diretas de renderização da UI. Elas devem ser encapsuladas em serviços dedicados de domínio ou actions isoladas.

### 2. Validações de Negócio vs. Validações Estruturais
* **Validações Estruturais:** Mapeiam a formatação do dado bruto (ex: se o email possui formato de email, se o nome não é vazio). Devem ser disparadas imediatamente na porta de entrada da requisição.
* **Validações de Negócio:** Mapeiam a lógica de conformidade de estado (ex: se o usuário possui saldo para o resgate). Devem rodar após as validações estruturais, consultando o estado consistente do banco e regras de regras de negócio.

### 3. Máquinas de Estado e Transições
* Lógicas de alteração de estados cruciais (ex: de `Pendente` para `Faturado`) devem seguir caminhos explícitos que impedem saltos inválidos (como `Pendente` direto para `Cancelado` sem validação).
* As transições devem registrar logs lógicos e manter consistência transacional do banco.
