# Rule: Níveis de Autoridade (Authority Levels)

## 🎯 Missão e Escopo
Definir oficialmente a hierarquia de fontes de informação e de autoridade técnica do ecossistema do projeto. Este guia estabelece qual documento deve prevalecer em caso de conflitos ou divergências de dados entre especificações, códigos e registros históricos.

## 🏛️ A Hierarquia Oficial de Informações
Em qualquer cenário de desenvolvimento, a ordem absoluta de precedência e autoridade técnica é a seguinte:

1. **Código-Fonte (Code):** O código fisicamente implementado e compilado é sempre a fonte da verdade definitiva do software. O que está escrito no código reflete a realidade da aplicação.
2. **Architecture Decision Records (ADR):** Registros históricos e ativos de decisões técnicas de arquitetura (ADRs). Possuem autoridade sobre especificações locais e estados passados.
3. **Especificações (Specifications):** Documentos de escopo estruturado e formulários preenchidos contidos em `.ai-workspace/specifications/` e `.ai-workspace/templates/`.
4. **Snapshot Operacional (`PROJECT_STATE.md`):** O registro atualizado de andamento do projeto. Ele serve apenas como um espelho operacional do último estado conhecido, nunca como fonte da verdade absoluta sobre o código.
5. **Registros de Execução (Logs):** Histórico de execução de tarefas, inventários e logs operacionais temporários.

---

## ⚖️ Resolução de Conflitos e Divergências

Quando forem detectadas discrepâncias de informações entre documentos, o desenvolvedor ou agente de IA deve adotar as seguintes diretrizes para resolução:

### 1. Conflito entre Código-Fonte e `PROJECT_STATE.md`
* **Cenário:** O `PROJECT_STATE.md` diz que uma funcionalidade não está implementada, mas o código-fonte daquela rota já existe e está funcional.
* **Resolução:** O Código-Fonte vence. A tarefa do agente de IA é ajustar e atualizar o `PROJECT_STATE.md` para refletir a realidade do código, nunca apagar o código sob alegação de que o documento dizia o contrário.

### 2. Conflito entre Especificações e ADRs
* **Cenário:** Uma nova especificação de funcionalidade propõe o uso de uma biblioteca ou estrutura que contradiz uma decisão de arquitetura documentada em uma ADR antiga.
* **Resolução:** A ADR ativa vence. A IA executora deve rejeitar a especificação conflituosa e notificar o Manager, a menos que haja um novo documento de ADR proposto e aprovado que substitua a decisão anterior.

### 3. Conflito entre Especificações e Código-Fonte
* **Cenário:** O código-fonte existente executa uma lógica A, mas uma nova especificação aprovada e ativa na pasta `.ai-workspace/specifications/` exige a lógica B.
* **Resolução:** A Especificação ativa vence, pois representa a nova intenção de negócios deliberada pelo usuário. O código-fonte deve ser refatorado de forma cirúrgica para se adequar à nova especificação.

---

## 🚫 Regra Inegociável
Nenhum agente de IA ou desenvolvedor tem autoridade para desrespeitar ou reescrever uma ADR ativa sem a geração de um novo registro de decisão correspondente. Em caso de dúvidas insolúveis entre as diretrizes de código e especificações, pause a execução e solicite clarificação direta ao usuário humano.
