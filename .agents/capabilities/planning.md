# Capability: Planning (v3-capability-planning)

| Metadado | Descrição / Valor |
| :--- | :--- |
| **Capability Name** | `v3-capability-planning` |
| **Supported Domains** | `["planning", "specifications", "work-units", "roadmaps"]` |
| **Supported Task Types** | `["requirements-analysis", "task-decomposition", "dependency-mapping", "complexity-estimation"]` |
| **Inputs** | `["specifications", "decisions (ADRs)", "PROJECT_STATE.md", "FRAMEWORK_INDEX.md"]` |
| **Outputs** | `["work-unit-files", "execution-plans"]` |
| **Required Context** | `["rules/always-read.md", "DEVELOPMENT_GUIDE.md"]` |
| **Optional Context** | `["PROJECT_STATE.md", "FRAMEWORK_INDEX.md"]` |
| **Execution Limits** | Proibido escrever ou editar código em `src/`, modificar arquivos de configuração ou executar comandos locais. Apenas planeja e decompõe tarefas. |
| **Success Conditions** | Classificação inequívoca de complexidade, decomposição atômica em Work Units usando o template oficial e grafo linear sem ciclos. |
| **Failure Conditions** | Tentativa de escrever código em `src/`, executar subprocessos de terminal ou gerar Work Units com escopo misto/sobreposto. |

---

## 🎯 Objetivo
Transformar especificações estáticas de projeto em planos de execução detalhados contendo uma sequência lógica de Work Units atômicas e ordenadas, determinando as complexidades, riscos e Capabilities associadas sem interagir diretamente com código-fonte ou execução de infraestrutura física.

---

## 🛠️ Escopo Operacional

### Responsabilidades
* Ler e realizar o parsing profundo de [Specifications](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/) contidas na pasta de planejamento.
* Identificar o objetivo principal de negócio e o escopo técnico delimitado.
* Estimar e classificar automaticamente a complexidade da demanda baseando-se em:
  * **Micro Task:** Manutenções pontuais em arquivos de texto ou documentação.
  * **Small Feature:** Alteração de um único componente visual ou rota isolada.
  * **Feature:** Criação de novos fluxos dinâmicos contendo rotas e componentes integrados.
  * **Epic:** Grandes transformações estruturais contendo múltiplos subsistemas.
* Decompor a especificação em um conjunto ordenado de **Work Units** atômicas de responsabilidade única.
* Mapear o grafo linear de dependências técnicas (evitando bloqueios circulares).
* Associar cada Work Unit criada à Capability de execução ideal da biblioteca (ex: `v3-capability-ui`, `v3-capability-documentation`).
* Emitir o plano de execução contendo riscos técnicos, critérios de aceitação e estimativa de esforço.

### Entradas (Inputs)
* Especificação da feature em `.ai-workspace/specifications/` (ex: `planning-runtime.md`).
* Decisões arquiteturais associadas em `.ai-workspace/decisions/` (ADRs).
* Snapshot do estado de progresso em [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md).

### Saídas (Outputs)
* Plano de Execução estruturado contendo riscos, complexidades e capacidades requeridas.
* Arquivos físicos de definição de Work Unit criados com base no template oficial da V3 em `.ai-workspace/specifications/active/` ou subpastas de planejamento.

### Dependências
* Specifications, [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md) e [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md).

---

## 🚫 Restrições de Escopo (Fronteiras)
* **Proibido Alterar Código:** Não pode criar, alterar ou excluir nenhum arquivo lógico na pasta `src/`.
* **Proibido Executar Comandos:** Não interage com comandos de build, testes ou linters locais (o Toolchain Gateway gerencia processos, mas para esta capability, nenhum comando é permitido).
* **Independência de Papéis:** Não atribui tarefas a personas fictícias (como Manager, Frontend, Backend); a atribuição ocorre unicamente à Capability adequada.

---

## 📚 Injeção de Contexto (Context Hydration)

### Contexto Obrigatório (Mandatory Context)
* [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) (Ancoragem absoluta de conduta).
* [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md) (Critérios gerais de divisão de tarefas).

### Contexto Opcional (Optional Context)
* [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md) (Histórico de sprints anteriores).
* [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md) (Índice de arquivos do repositório).

### Contexto Proibido (Forbidden Context)
* Todo o código-fonte de apresentação visual e lógica de dados em `src/`.
* Guias específicos de conhecimento estético ([ui.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ui.md)) ou segurança ([security.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/security.md)) para prevenir a poluição do escopo analítico.

---

## 💾 Memória Volátil (Runtime State)

### Runtime Inputs
* `WorkUnitId`: O identificador da tarefa de planejamento ativada.
* `TargetSpecificationPath`: O caminho da especificação estática a ser interpretada.

### Runtime Outputs
* `WorkUnitsGenerated`: Lista de caminhos das Work Units criadas no formato `.md`.
* `ExecutionPlanPath`: Caminho do plano de execução gerado.
* `EstimatedUnitsCount`: Quantidade total de Work Units propostas.

---

## ⚙️ Configurações de Toolchain

### Validation Commands
A Planning Capability não aciona ferramentas de validação física locais do desenvolvedor. A homologação sintática das Work Units geradas é efetuada pelo Toolchain Gateway por meio de validadores passivos de integridade de links markdown e parsing de arquivos JSON/YAML se houver metadados.

---

## Allowed Side Effects
* Geração do arquivo estático de planejamento e das Work Units físicas ativas em subpastas de `.ai-workspace/specifications/`.
* Atualização do status de planejamento em [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md).

---

## 🏆 Critérios de Homologação

### Critérios de Sucesso
* Toda Work Unit proposta deve ser associada a exatamente uma Capability da biblioteca.
* O grafo de dependências entre as Work Units deve ser perfeitamente linear (WU-02 depende de WU-01, sem retornos de estado ou concorrência cruzada).
* Identificação clara de riscos de escopo e definição precisa de critérios de aceitação para cada tarefa gerada.
* Conformidade estrutural estrita com o template de Work Unit da versão V3.

### Critérios de Falha
* Qualquer inclusão ou sugestão de código fonte nas saídas geradas.
* Mapeamento de dependências cíclicas (ex: WU-02 dependendo de WU-03 que depende de WU-02).
* Criação de Work Units genéricas sem critérios de aceitação e outputs de arquivos claros.

---

## 🔄 Exemplo de Execução (Payload e Fluxo)

```json
{
  "transaction_id": "tx_plan_887755",
  "capability": "v3-capability-planning",
  "work_unit": {
    "id": "WU-023",
    "domain": "planning",
    "title": "Planejar a integração da API de Usuários"
  },
  "runtime_inputs": {
    "target_specification": "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/user-api.md"
  },
  "runtime_outputs": {
    "status": "SUCCESS",
    "work_units_generated": [
      "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/active/wu-024-db-schema.md",
      "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/specifications/active/wu-025-api-endpoint.md"
    ],
    "execution_plan_path": "C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/roadmaps/execution-plan-user-api.md"
  }
}
```
