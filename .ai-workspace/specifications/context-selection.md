# Especificação de Seleção de Contexto (Context Selection) — V3.0

Este documento define oficialmente a especificação e as regras do algoritmo de **Context Hydration** (Hidratação de Contexto) e da política de **Lazy Loading** aplicadas pelo Context Builder.

---

## 🧭 Algoritmo de Context Hydration

O processo de hidratação dinâmica e seletiva de contexto para alimentar a Execution Engine ocorre sob a seguinte sequência determinística de 6 etapas lógicas:

```text
Entrada (Work Unit + Capability + Domínio)
   │
   ├──> 1. Análise de Requisitos (Identifica os arquivos físicos e metadados)
   │
   ├──> 2. Consulta de Resolução (Lê a tabela de regras no FRAMEWORK_INDEX.md)
   │
   ├──> 3. Separação de Arquivos (Separa obrigatórios, opcionais e proibidos)
   │
   ├──> 4. Execução de Lazy Loading (Carrega sob demanda arquivos secundários)
   │
   ├──> 5. Filtragem de Context Bloat (Limpa redundâncias e comentários)
   │
   └──> Entrega (Payload final de contexto compilado para a Engine)
```

### Detalhamento das Etapas:
1. **Entrada de Parâmetros:** O Context Builder recebe a Work Unit ativa, a Capability acoplada pelo Loader e o domínio técnico da tarefa.
2. **Resolução de Regras:** O Builder lê o arquivo [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md) para verificar quais guias conceituais são elegíveis ou obrigatórios para aquela Capability de acordo com o domínio.
3. **Mapeamento de Código:** A Engine examina as declarações de importações nos arquivos de código-fonte mapeados para a tarefa para agrupar arquivos de dependências imediatos.
4. **Respeito a Proibições:** Todos os documentos declarados como proibidos (*Forbidden*) no contrato da Capability são sumariamente eliminados do payload.
5. **Sanitização:** O Context Builder expurga comentários redundantes de documentação interna dos arquivos de regras para economizar tokens.
6. **Entrega de Payload:** O payload compactado final é montado e entregue à Execution Engine.

---

## ⚡ Política de Lazy Loading (Carregamento Preguiçoso)

Para manter o menor consumo de contexto possível, o Context Builder aplica uma estratégia rígida de **Lazy Loading**:

1. **Camada Primária (Imediata):** Apenas as regras de conduta absoluta (`rules/always-read.md`), a especificação da feature e o arquivo de código-fonte a ser diretamente modificado são carregados no primeiro turno.
2. **Camada Secundária (Sob Demanda):** Arquivos conceituais da Knowledge Layer (ex: `knowledge/accessibility.md`) e componentes importados são carregados **somente se** a Execution Engine emitir um log de solicitação declarando a necessidade de consulta (ex: "Solicitando leitura de accessibiliy.md").
3. **Descarte Imediato:** Assim que a validação técnica da Work Unit é concluída, a Execution Engine expurga os arquivos lidos da memória de contexto, impedindo o acúmulo de tokens no histórico.

---

## 🛡️ Tratamentos Especiais e Fallback

* **Estouro de Budget de Contexto:** Caso o payload ultrapasse o limite de tokens (*Context Budget*) estipulado no contrato da Capability, o Builder prioriza a remoção de guias opcionais da Knowledge Layer. Se persistir, o Builder fraciona os arquivos de código-fonte para injetar apenas as assinaturas de funções e tipos, reduzindo o volume do payload.
* **Fallback de Carregamento:** Se um arquivo de código-fonte mapeado para a tarefa estiver corrompido ou inacessível no diretório local, o Builder emite um log de aviso e fornece a assinatura conceitual baseada na especificação do projeto, evitando travar a leitura de contexto da IA.
