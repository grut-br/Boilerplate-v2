# Diretrizes de Arquitetura de Software

Esta documentação solidifica a filosofia estrutural e os princípios de engenharia de software que fundamentam os nossos projetos. Ela vai além de ferramentas modernas (como o Next.js) e atua como a garantia de longevidade, testabilidade, modularidade e escalabilidade robusta em aplicações web de classe corporativa.

## 🏛 Princípios Fundamentais

### 1. Clean Architecture & Separação de Preocupações
Nosso ecossistema impõe a divisão estrita entre a camada de domínio (a lógica do negócio) e a camada de apresentação/ferramentas. A complexidade visual da interface de usuário nunca deve se entrelaçar diretamente com transações de banco de dados e fluxos de controle lógico, blindando o software de dívidas técnicas.

### 2. Feature-Sliced Design (FSD)
O projeto rejeita a organização puramente baseada em tipologia de arquivos global (por exemplo, "todos os componentes aqui" ou "todos os utilitários ali") para adotar um arranjo por agrupamento funcional de módulos lógicos de negócio.
* O diretório de **Features** atua como o eixo principal. Módulos como `auth`, `billing` ou `users` são autossuficientes e isolados.
* Cada Feature possui componentes visuais, lógicas de processamento exclusivas, schemas estáticos de validação e comunicação de dados próprios, encapsulando sua complexidade interna e expondo somente interfaces estritas.

### 3. Componentização e Reutilização Eficiente
* Existe uma barreira rígida entre os componentes estruturais do sistema (Layouts mestres), módulos atômicos e abstraídos de UI puros (Design System e inputs genéricos) e componentes com injeção de regra de negócios específica.
* **DRY (Don't Repeat Yourself):** Abstrações devem ser criadas sempre que uma mesma estrutura visual ou de validação for repetida. Duplicações desnecessárias criam fragilidades na manutenção escalonada.

### 4. Simplicidade (KISS) e Sólida Manutenção (SOLID)
* **KISS (Keep It Simple, Stupid):** A complexidade tem um custo. Não promova overengineering com abstrações prematuras se a escala atual do módulo não o exigir. Soluções legíveis e retas são estritamente priorizadas frente a lógicas densas.
* **Princípio da Responsabilidade Única (SRP - SOLID):** Entidades (como funções, serviços ou componentes visuais) devem ter um único foco e justificativa de existência. Componentes que misturam exibição e busca paralela massiva de dados devem ser refatorados imediatamente em subdivisões menores.

## 📂 Organização Prática e Fluxo

### Divisão de Papéis Frontend & Backend na Mesma Base
* **Camada de Apresentação (View):** Puramente reativa e visual. Layouts, seções e páginas devem atuar como compositores, injetando dados para os componentes filhos gerenciarem, mantendo o markup limpo e fluído.
* **Camada de Ação e Controle (Server Actions):** Atua como interceptador de intenções do usuário. Tem o dever inegociável de realizar validações severas dos dados brutos recebidos antes de invocar a infraestrutura ou serviços, devolvendo sempre um feedback previsível em estrutura padronizada para o front-end exibir.
* **Camada de Domínio / Dados:** Responsável pelo suprimento limpo, onde se firmam os schemas estáticos (Zod) e o acesso ao cliente de banco de dados sob regras RLS estritas de autorização.

### Estruturação de Pastas Universal
* **Acessórios Globais:** Componentes atômicos e recursos que compõem o sistema visual macro (ex: configurações estáticas, utilitários puros) estão expostos globalmente, nunca retendo restrições de regras de negócio em suas lógicas de funcionamento.
* **Encapsulamento de Features:** A lógica central só opera com as dependências do seu próprio módulo de negócios. As dependências transversais fluem através da composição.
* **Inteligência Documental:** Todas as deliberações, roadmaps, arquivos de log e definições do processo de concepção devem fluir exclusamente pelo diretório de documentação de IA (`.ai-workspace`), afastando da raiz da compilação recursos não acionáveis em produção.
