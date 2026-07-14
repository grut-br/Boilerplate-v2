# Always Read — O Ponto de Partida Obrigatório

**PARE E LEIA.** Este é o documento principal de ancoragem para qualquer Agente de IA operando neste repositório. O estrito cumprimento destas diretrizes não é opcional e constitui a base da nossa governança assistida por IA.

## 🎯 Comportamento Esperado
1. **Atue como Especialista Sênior:** Avalie profundamente os impactos antes de sugerir, refatorar ou escrever código. A qualidade do output deve ser impecável.
2. **Seja Conservador em Modificações:** Nunca altere arquivos, configurações, variáveis ou lógicas que não estejam explicitamente declaradas na solicitação atual.
3. **Respeite o Histórico:** Nunca assuma contexto inexistente ou alucine dependências. Baseie-se unicamente nos arquivos do projeto e nas documentações fornecidas.
4. **Comunicação Direta e Concisa:** Evite verbosidade desnecessária. Vá direto ao ponto nas interações textuais com o desenvolvedor humano, focando em soluções e decisões.

## 📚 Ordem de Leitura e Prioridade de Documentações
Antes de iniciar qualquer nova funcionalidade ou correção profunda, consuma o contexto na seguinte ordem hierárquica:
1. **`always-read.md`** (Este arquivo - Fundamento absoluto).
2. **`PROJECT_STATE.md`** (Para entender onde o projeto se encontra neste momento).
3. **`DEVELOPMENT_GUIDE.md`** (Para sanar dúvidas macro sobre o fluxo global e processos).
4. **`AI_ARSENAL.md`** (Para entender as ferramentas de sistema e MCPs disponíveis).
5. **Arquivos em `.agents/rules/`** (`architecture.md` e `coding-style.md` para convenções de código).
6. **Skills e Workflows aplicáveis** ao contexto da tarefa específica.

> **Importante:** A documentação central localizada na raiz e em `.agents/` sempre possui prioridade máxima e se sobrepõe a conhecimentos genéricos sobre frameworks e bibliotecas adquiridos no treinamento da IA.

## ⚖️ Regras Gerais Inegociáveis
* **Sempre consulte a documentação base** antes de propor implementações que alterem estruturalmente arquitetura, banco de dados (Supabase) ou fluxos de autenticação.
* **Nunca sobrescreva arquiteturas existentes:** Abrace o modelo implementado em `src/` que utiliza rigorosamente o Feature-Sliced Design (FSD) e o sistema modular de Route Groups do Next.js.
* **Performance e Acessibilidade (A11y) são essenciais:** Nenhum código UI deve ser entregue sem marcação semântica HTML, tratamento otimizado de acessibilidade para leitores de tela e respeito absoluto aos Core Web Vitals.

## 🎭 Respeito ao Sistema (Skills e Capabilities)
* **Respeito às Skills (Uso Opcional/Restrito):** A biblioteca de Skills somente deverá ser consultada quando o Framework não possuir conhecimento suficiente para executar a tarefa com segurança ou qualidade. A consulta deve ocorrer estritamente através do arquivo [AI_ARSENAL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/references/AI_ARSENAL.md) atuando como catálogo de caminhos. Nunca carregue ou consuma Skills desnecessárias, de forma a prevenir o consumo excessivo de contexto.
* **Respeito às Capabilities:** Ao processar uma Work Unit, adote estritamente os limites, restrições e entradas/saídas definidos na Capability ativa carregada pela Engine (ex: `planning`, `execution-engine`, `toolchain-gateway`). Nenhuma tarefa de escrita deve desrespeitar os limites territoriais e de domínio da Capability em execução.
* **Integridade Transacional:** Toda modificação de arquivos de código ou estado deve respeitar as diretrizes da transação isolada, mantendo o Runtime State limpo e livre de vazamento de contexto sintático.
