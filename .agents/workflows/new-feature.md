# Workflow: Nova Funcionalidade (New Feature)

## 🎯 Objetivo
Padronizar o ciclo de vida completo de desenvolvimento de qualquer nova funcionalidade (Feature), garantindo que ela seja entregue com alta qualidade, arquitetura limpa e de forma puramente incremental.

## 📊 Classificação da Tarefa
Este workflow deve ser acionado **apenas após** o Manager classificar a tarefa de entrada em um dos níveis de complexidade (**Epic**, **Feature** ou **Small Feature**). Se a tarefa for classificada como **Micro Task**, ela deve ser direcionada para o modo **Fast Track** simplificado, desconsiderando as etapas deste documento.

## 📦 O Conceito de Work Unit
Para evitar sobrecarga de contexto e garantir a máxima qualidade, todo desenvolvimento é fracionado na menor unidade possível: a **Work Unit**.
* **O que é:** A menor parcela de código e lógica que pode ser implementada, testada e concluída de forma independente. Uma Work Unit deve focar em apenas uma responsabilidade estrita da engenharia.
* **Como criar:** Antes de iniciar o código, liste os passos lógicos necessários para a Feature existir. Cada passo isolado verticalmente (Dados, Lógica, Visual) torna-se uma Work Unit.
* **Qual o tamanho ideal:** Deve ser pequena o suficiente para ser concluída em um único ciclo ininterrupto de raciocínio (um comando de agente, ou uma tarefa ágil curta).
* **Como dividir Features grandes:** Se a Feature é um "Carrinho de Compras", as Work Units seriam: 1. Modelagem de Dados, 2. Endpoint de Lógica, 3. Componente Visual de Item, 4. Layout Estrutural, 5. Integração. Nunca faça interface visual e banco de dados simultaneamente na mesma Work Unit.
* **Quando termina:** Quando a entrega atende ao objetivo da unidade isolada, não quebra nada preexistente no ecossistema e passa nos critérios de qualidade.
* **Como registrar:** Atualizando o checklist daquela tarefa específica no documento `PROJECT_STATE.md`.

## 🚦 Quando Utilizar
Sempre que uma demanda envolver a criação de uma funcionalidade inédita no escopo do projeto, que exija nova lógica de negócios, componentes visuais estruturais ou persistência de dados.

## 📥 Entradas Obrigatórias e Pré-requisitos
* **Entradas:** Escopo claro do negócio, design/UI esperado (se aplicável), e regras lógicas de dados definidas.
* **Pré-requisitos:** O ambiente deve estar estável e o `PROJECT_STATE.md` deve estar atualizado refletindo o momento anterior ao início da Feature.

## 🔄 Ordem Completa das Etapas
1. **Descoberta & Especificação:** Compreender perfeitamente o escopo que deve ser desenvolvido.
2. **Divisão (Scoping):** Quebrar a Feature obrigatoriamente em múltiplas Work Units.
3. **Desenvolvimento (Loop Incremental):** Para cada Work Unit listada:
   - Iniciar e assimilar o contexto isolado.
   - Implementar a unidade.
   - Validar o funcionamento de forma unitária.
   - Registrar a conclusão da unidade.
4. **Integração:** Conectar de forma orquestrada as Work Units concluídas e testar a Feature na visão do usuário final.
5. **Revisão Técnica:** Acionar e submeter a entrega ao workflow de `review.md`.
6. **Entrega (Conclusão):** Promover as atualizações documentais finais.

## 🛑 Critérios para Iniciar
- O objetivo final da Feature está cristalino e isento de ambiguidades de negócio.
- O desenho estrutural foi definido mentalmente ou documentado, e as Work Units foram catalogadas nas próximas tarefas.

## 🏁 Critérios para Concluir e de Qualidade
- A funcionalidade atende integralmente ao escopo solicitado.
- O código segue rigorosamente a arquitetura estipulada globalmente e respeita os padrões descritos em Coding Style.
- Nenhuma regressão paralela foi introduzida no sistema como efeito colateral.
- Os indicadores vitais de performance e de acessibilidade foram resguardados.

## 📝 Atualizações Obrigatórias na Documentação
Ao longo e no término da jornada, o desenvolvedor ou agente de IA **deve**:
1. Gerenciar o `PROJECT_STATE.md`, movendo a Feature dinamicamente por "Próximas Tarefas" -> "Em Andamento" -> "Concluídas".
2. Registrar decisões técnicas atípicas e vitais na seção "Decisões Importantes".
3. Anexar débitos técnicos novos (Tech Debt) à seção de Pendências para resolução póstuma.

## ✅ Checklist Final
- [ ] A Feature foi estrategicamente dividida em Work Units antes da implementação?
- [ ] Todas as Work Units foram codificadas e validadas em completo isolamento?
- [ ] A funcionalidade manteve o encapsulamento (sem vazar escopo/complexidade pro sistema global)?
- [ ] Os ritos do Workflow de Revisão Técnica foram respeitados?
- [ ] O `PROJECT_STATE.md` consolida o status da Feature como concluída com exatidão?
