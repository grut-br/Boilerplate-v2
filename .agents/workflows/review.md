# Workflow: Revisão Técnica (Code Review)

## 🎯 Objetivo
Fornecer um roteiro sistemático, rígido e agnóstico de checagem. A meta é asseverar imaculada e perenemente que qualquer código criado (por IA ou Humano) transite e bata os estritos padrões de arquitetura corporativa, legibilidade imaculada e performance sustentável antes de sua consagração e inserção na base.

## 📊 Classificação da Tarefa
Este workflow de revisão é aplicado a revisões de **Feature** e **Small Feature**. Para revisões derivadas do fluxo **Fast Track** (Micro Tasks), a checagem é feita de forma simplificada e direta pelo desenvolvedor humano, sem necessidade de isolar Work Units formais de revisão.

## 📦 O Conceito de Work Unit
A revisão de qualidade jamais ataca sistemas massivos com dezenas de implementações de uma só vez. A análise fina depende estritamente das proporções da **Work Unit**.
* **O que é:** O turno da fiscalização voltado para analisar, peça por peça, os fragmentos implementados sem que o montante macule ou disperse a visão crítica.
* **Como criar:** O responsável secciona o projeto pronto no exato espelhamento das Work Units listadas no planejamento e audita verticalmente. Exemplo: A auditoria da lógica de autorização deve passar na esteira de aprovação antes sequer de auditar as animações de interface de perfil que as acompanham.
* **Qual o tamanho ideal:** A revisão de uma unidade deve demandar dedicação temporal pontual. Ela analisa unicamente o peso cognitivo daquela fronteira de inputs, transformações e outputs sob o prisma da única responsabilidade.
* **Quando termina:** Na ausência universal de pendências no check-list obrigatório. Se houver devolução (rework), a Work Unit da Revisão é pausada e retrocede o projeto ao agente implementador.
* **Como registrar:** Movimentando as listagens da documentação matriz `PROJECT_STATE.md` transicionando do bloqueio formal de "Pendente de Review" à plenitude resolvida em "Concluída".

## 🛡 Áreas de Validação (O que se deve Checar)

1. **Arquitetura & Design de Software:**
   - A Work Unit está fielmente cimentada em seu escopo de negócios (Feature correta)?
   - Componentes ou controladores violaram fronteiras e cruzaram as separações impostas para se entrelaçarem de forma irregular e acoplada?
2. **Código & Estilo Semântico:**
   - As imposições documentais gramaticais do Coding Style (padrão de nomes de classes, diretórios estruturados em Kebab e pastas de interface) foram mantidas sem desvios?
   - Inserções de lógica e tipagem contam com fundação robusta ignorando subterfúgios permissivos vazios e tipando rigorosamente via contrato ou schemas?
3. **Responsabilidades & Reutilização (SRP/DRY):**
   - Módulos da área visual ou painéis comportam unicamente a visão sem agirem de forma intrusiva em cálculos intensos ou na obtenção primária das frentes de dados?
   - Soluções inéditas injetadas recém chegaram mimetizando regras, painéis, inputs já previamente abstrados em diretórios UI que deveriam ter sido consumidos pelo agente implementador?
4. **Performance:**
   - Áreas contendo cargas intensivas de mídia e conteúdo estrutural invisível obedecem os preceitos do adiamento inteligente e interativo?
   - Lógicas base de varreduras demonstram ciclos repetitivos desprovidos de inteligência de percurso e que se demonstrem exponencialmente destrutivos em grande volume?
5. **Segurança Extrema:**
   - A camada do servidor reavalia inegociavelmente dados recém transitados sem depender apenas e cegamente que o formulário da interface o tenha efetuado de boa-fé?
   - Credencias sigilosas de acessos terceiros em variáveis foram vazadas pelo trânsito indiscriminado rumo as mãos do cliente?
6. **Responsividade & Acessibilidade (A11y):**
   - Componentes primários de texto e cliques apresentam legibilidade inconstante quando prensados ou alargados bruscamente sob larguras limítrofes adversas?
   - Leitores interpretativos e o controle pleno do foco motor de uso sem cursor visual obedecem e decodificam perfeitamente todos os passos recém estabelecidos da tela na entrega do projeto?
7. **Documentação e Memória Cognitiva:**
   - A Work Unit ostenta elegância na abstração das nomeclaturas ou exige anotações e rastreios contínuos, denotando confusões intrínsecas e opacidade do "O que está sendo feito"?

## ✅ Checklist de Aprovação Final
- [ ] A Unidade examinada preencheu estritamente suas fronteiras propostas dispensando o que transbordar desnecessariamente do design e plano original?
- [ ] Não restam escoras, rascunhos em console perdidos, anotações de test-driven esquecidas ou hacks arquiteturais que gerem hipotecas invisíveis na longevidade da base?
- [ ] Todos os trâmites do `PROJECT_STATE.md` transparecem as mudanças recém acionadas na memória permanente mantendo a fonte da verdade em sintonia total e real com as modificações estruturais?
- [ ] Todo o corpo do ecossistema transita alinhado em espelho direto a governança de Clean Architecture e dos modelos de Isolamento global estipulados nos arquivos mestre?

Havendo repulsa afirmativa nestes checkpoints práticos e vitais, aborta-se incontinenti a incorporação do trajeto final. O componente retrocede imediatamente perante a persona inicial sob emissão técnica pormenorizada das violações.
