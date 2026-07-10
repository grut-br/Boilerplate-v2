# Código Limpo (Clean Code)

Este documento reúne os padrões de excelência de escrita de código. O objetivo é garantir que a base de código seja de fácil leitura, simples de modificar e autoexplicativa tanto para humanos quanto para outros agentes de IA.

## ✍️ Diretrizes de Código Limpo

### 1. Legibilidade e Clareza
* O código deve ser lido como um texto bem estruturado. Use nomes de variáveis e funções altamente expressivos e semânticos.
* Prefira nomes descritivos longos a abreviações misteriosas (ex: `calculateUserDiscount` em vez de `calcDisc`).

### 2. Princípio da Responsabilidade Única (SRP)
* Cada função, classe ou componente deve realizar exatamente uma tarefa e fazê-la bem.
* Se uma função realiza mais do que uma transformação lógica ou lógica condicional, ela deve ser dividida em funções menores.

### 3. Nomes e Semântica do Domínio (Ubiquitous Language)
* A nomenclatura do código deve refletir estritamente os conceitos e jargões do domínio do negócio, evitando termos puramente técnicos em variáveis de regras de negócio.
* Mantenha consistência gramatical (ex: use verbos para funções, como `fetchData`, e substantivos para classes/variáveis, como `userProfile`).

### 4. Simplicidade (KISS - Keep It Simple, Stupid)
* Evite soluções "inteligentes" e complexas quando uma abordagem direta e simples resolve o problema de maneira eficiente.
* A sofisticação do código está em torná-lo simples de entender, e não em demonstrar complexidade técnica desnecessária.

### 5. Eliminação de Duplicidades (DRY vs. WET)
* **DRY (Don't Repeat Yourself):** Evite duplicar lógica de negócios ou estrutural. Crie abstrações reutilizáveis e centralizadas.
* **Atenção:** Evite a "abstração prematura". Se duas lógicas parecem semelhantes mas mudam por razões de negócios diferentes, duplicar temporariamente é melhor do que criar um acoplamento ruim.

### 6. Complexidade Cognitiva
* Reduza o número de caminhos lógicos em uma mesma função. Evite aninhamentos profundos de condicionais (ifs aninhados).
* Use cláusulas de guarda (guard clauses) para retornar cedo de funções quando condições inválidas forem detectadas, mantendo o fluxo principal linear.
