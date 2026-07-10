# Workflow: Landing Page

## 🎯 Objetivo
Estabelecer o processo ideal e incremental para a produção de Landing Pages, garantindo que o fluxo não degenere em páginas monolíticas, pesadas ou com baixa acessibilidade. O foco inegociável é conversão, Search Engine Optimization (SEO) superior e usabilidade premium.

## 📊 Classificação da Tarefa
Este workflow deve ser acionado **apenas após** o Manager classificar a tarefa de entrada em um dos níveis de complexidade (**Epic**, **Feature** ou **Small Feature**). Se a tarefa for uma **Micro Task** visual ou cosmética, ela qualifica-se para o modo **Fast Track** simplificado, dispensando a complexidade deste fluxo.

## 📦 O Conceito de Work Unit
Uma Landing Page jamais é desenvolvida com um passe mágico de topo a base simultaneamente. Ela é seccionada em **Work Units**, que neste paradigma representam Seções Isoladas Visuais ou Camadas de Otimização Específicas.
* **O que é:** Uma Work Unit é uma seção única (ex: Hero, FAQ, Footer) ou um turno dedicado puramente à refinamentos (ex: Otimização SEO).
* **Como criar:** O wireframe ou design da página deve ser fatiado horizontalmente. Cada dobra ou bloco de informação converte-se em uma Work Unit apartada.
* **Qual o tamanho ideal:** Uma seção visual completa, independente estruturalmente, capaz de ser testada e avaliada sozinha na janela do navegador.
* **Como dividir Features grandes:** O objetivo "Landing Page Completa" torna-se: 1. Setup Base; 2. Hero Section; 3. Features Section; 4. Call to Action (CTA); 5. Refinamento de SEO; 6. Auditoria de Performance.
* **Quando termina:** Uma unidade se encerra quando renderiza de forma idêntica e responsiva em todos os dispositivos previstos, portando toda a acessibilidade requerida, sem degradar seções adjacentes.
* **Como registrar:** Assinalando a Work Unit da respectiva etapa visual como despachada no `PROJECT_STATE.md`.

## 🔄 Ordem das Etapas e Seções (Fluxo)
1. **Descoberta:** Consolidação dos elementos não técnicos: Copies estruturados, recursos de imagem/mídia mapeados e paleta temática clara.
2. **Especificação:** Delineamento da estrutura macro em Work Units, prevendo como os blocos irão se encaixar ao final.
3. **Hero:** Codificação e implementação exclusiva da primeira dobra (First Fold - acima da linha de rolagem). Sendo o ponto de máximo atrito do usuário, esta unidade demanda rigor impecável.
4. **Demais Sections:** Desenvolvimento sucessivo e isolado das sessões posteriores (ex: Prova Social, Oferta, Dúvidas, Footer). Uma por Work Unit, sequencialmente.
5. **Responsividade:** Etapa integral de auditoria de quebras ao redimensionar a tela, cobrindo micro e ultra-wide viewports.
6. **SEO:** Injeção minuciosa de metadados estáticos, hierarquia lógica das tags de semântica de conteúdo (ex: um único `H1` global, subtítulos coerentes em `H2`/`H3`) e indexadores para robôs.
7. **Performance:** Turno exclusivo de otimização de imagens, técnicas de postergação de renderização (lazy load fora do viewport inicial) e minificação de peso global.
8. **Acessibilidade:** Aplicação estrita de atributos ARIA e comprovação de viabilidade completa de navegação usando estritamente o teclado.
9. **Validação:** Inspeção final simulando a jornada real do visitante alvo.
10. **Conclusão:** Chancela e encerramento, pontuando o fim da campanha de Landing Page no registro de estado central.

## 🏁 Critérios para Cada Etapa e Quando uma Seção está Pronta
Uma seção de Landing Page apenas qualifica-se como pronta e autoriza o fluxo a descer para a próxima Work Unit caso:
* Atue sob encapsulamento severo (sem poluição cruzada de lógicas de estilo que quebrem blocos irmãos).
* Adapte-se fluentemente ao longo de todo o espectro de resoluções de telas disponíveis.
* Aplique o nível de excelência definido pela agência em uso de contrastes e espaçamentos simétricos (UX).

## ⚡ Critérios de Performance Críticos
* Sob nenhuma circunstância a seção **Hero** deverá portar elementos bloqueadores pesados. O "Time to Interactive" do First Fold é intocável.
* Todos os recursos de imagem e vetoriais devem prover dimensionamento nativo e peso ultraleve.
* Media assets situados fora do limite visível do usuário no load inicial são postos sumariamente em carregamento postergado.

## 🎨 Critérios de UX Diferenciada
* Componentes que convidam interações tangíveis (Botões, Inputs, Cards Clicáveis) devem necessariamente possuir animações microscópicas e fluidas para sinalizar engajamento instantâneo.
* Sistemas de tipografia são dinâmicos; devem expandir e retrair graciosamente respeitando a mancha gráfica exigida pelas matrizes móveis e desktop simultaneamente.
