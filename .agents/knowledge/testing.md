# Princípios de Testes (Testing)

Este documento reúne a filosofia de validação técnica da qualidade do software. Os testes garantem a resiliência do sistema e fornecem segurança para refatorações sem introduzir bugs.

## 🧪 Estratégias de Validação

### 1. Pirâmide de Testes e Tipologia
* **Testes Unitários:** Foco no isolamento completo de lógicas computacionais puras (ex: conversores de dados, utilitários, cálculo de impostos). Devem ser rápidos e testar múltiplos caminhos de entrada de dados.
* **Testes de Integração:** Validam a comunicação correta entre diferentes partes ou camadas do próprio software (ex: um fluxo lógico conversando com o banco de dados).
* **Testes de Ponta a Ponta (E2E):** Validam a jornada sob a perspectiva do usuário final através de simulações em navegadores reais, focando em fluxos críticos de negócio.

### 2. Validação Estática
* A análise estática de código (linters e checagem de tipos estáticos) deve rodar de forma contínua para prevenir falhas bobas de sintaxe e inconsistências de tipagem antes de qualquer compilação ou execução de testes mais pesados.

### 3. Determinismo e Isolamento dos Testes
* Testes devem ser deterministas. O mesmo teste executado 100 vezes sob as mesmas condições deve retornar o mesmo resultado.
* Testes de banco de dados ou chamadas de APIs externas devem usar dublês (mocks) ou ambientes isolados que limpam seus rastros a cada rodada de execução, evitando poluição de dados estáticos.

### 4. Cobertura vs. Confiança
* A prioridade do plano de validação não é a obtenção de 100% de cobertura de linhas escritas com testes irrelevantes, mas sim garantir robustez nas regras de negócios críticas e nas interfaces de integração complexas do sistema.
