# Workflow: Resolução de Bugs (Bugfix)

## 🎯 Objetivo
Sistematizar de forma empírica o método para localizar, diagnosticar e mitigar falhas operacionais ou regressões do sistema. A filosofia se baseia em descobrir a anomalia fundamental e neutralizá-la no cerne, rejeitando categoricamente intervenções rasas ou band-aids pontuais.

## 📊 Classificação da Tarefa
Este workflow deve ser acionado **apenas após** o Manager classificar o bug. Falhas críticas estruturais, de segurança ou de regras de negócio exigem este processo. Correções cosméticas simples ou ajustes isolados de texto (Micro Tasks) devem fluir diretamente via modo **Fast Track**.

## 📦 O Conceito de Work Unit
Até a erradicação de bugs sujeita-se à metodologia fracionada das **Work Units**.
* **O que é:** Segmentos ordenados das fases de descoberta e reparação da anomalia.
* **Como criar:** Abstendo-se de entrar em códigos indiscriminadamente e dividindo o ataque em passos lógicos: 1. Obtenção de métricas (Reprodução isolada); 2. Infiltração Analítica e mapeamento de escopo (Causa Raiz); 3. Cura controlada e provisória (Laboratório); 4. Assentamento na Main (Refatoração cirúrgica).
* **Qual o tamanho ideal:** O menor escopo estritamente focado em testar uma hipótese de origem, ou na resolução hermética que restaura o sistema.
* **Como dividir Features grandes:** Falhas intermitentes massivas não são consertadas em um lance de genialidade, elas são cercadas por Work Units de diagnóstico progressivo eliminando camada por camada da aplicação.
* **Quando termina:** O ciclo finda instantaneamente após a exata falha mapeada cessar a sua eclosão sob idênticas circunstâncias, assegurado de que a intervenção foi na verdadeira fonte.
* **Como registrar:** Limpando os status na seção de "Bloqueios", documentando a causa encontrada nas lógicas do registro oficial `PROJECT_STATE.md`.

## 🔄 Ordem Completa das Etapas (Fluxo)
1. **Reprodução:** **Se você não puder recriar, você não conseguirá curar.** Proíbe-se expressamente o toque em arquivos estruturais antes do bug ter seu ecossistema exato mapeado e disparado sob demanda.
2. **Diagnóstico:** Abertura investigativa dos logs. Monitoração dos rastros de execução de funções e escrutínio dos parâmetros nas comunicações visando encontrar a barreira onde o dado foi corrompido ou o fluxo descarrilou.
3. **Causa Raiz (Regra de Ouro):** Exige-se a escavação contínua e obstinada visando encontrar o ponto-zero da desintegração. Proíbe-se terminantemente aplicar "chaves de verificação (ex: if exists)" no ponto em que o sistema apita erro sem descobrir o motivo primário pelo qual a entidade estava inesperadamente ausente.
4. **Correção:** Manobra de microcirurgia. Ateração limpa do segmento danificado utilizando o mínimo impacto tangencial no escopo das áreas adjacentes saudáveis, preservando a coerência visual e da arquitetura original em torno do ferimento.
5. **Teste:** Submissão das mesmas exatas condições operadas na etapa 1 e garantia da inexistência da quebra e retomada do percurso funcional (Happy Path).
6. **Validação:** Inspeção cautelosa das rotinas de dependência na órbita de área recém corrigida a fim de detectar possíveis fissuras e quebras colaterais involuntárias.
7. **Documentação:** Narrativa no registro de projeto descrevendo a bizarrice original atípica, sua matriz de surgimento e, o cerne, qual a conduta para coibir idêntica ocorrência futuramente.
8. **Conclusão:** Fechamento e encerramento, pontuando vitória técnica sobre a dívida.

## 🚫 Regras Críticas Invioláveis
* **Nunca atacar meros Sintomas:** A anomalia exposta em console do formato clássico de tipo nulo é, majoritariamente, o grito final do sistema. A essência do problema encontra-se nas cascatas lógicas predecessoras. Busque e erradique-o lá.
* **O Efeito Cascata Reverso:** Remendos que abracem mutações gigantescas na estrutura de múltiplos módulos do software devido a um único bug não se enquadram neste escopo. Caso a "cura" exigir que se reescreva e altere arquiteturas inteiras, paralise a etapa e agende imediatamente uma nova tarefa estrutural de **Tech Debt** ou de Feature de Escopo, submetendo esse plano maior à governança. O Bugfix opera restritamente sob isolamento máximo de impacto.
