# Arsenal de IA — Recursos e Ferramentas Disponíveis

Este arquivo cataloga todos os servidores MCP e Skills locais configurados para este boilerplate. Qualquer agente de IA ou desenvolvedor operando neste projeto deve consultar este documento para entender as ferramentas disponíveis antes de iniciar qualquer tarefa.

---

## 🔌 Servidores MCP (Model Context Protocol)

Os servidores MCP abaixo estão integrados ao ambiente do agente e podem ser chamados diretamente para automação de tarefas:

### 1. chrome-devtools-mcp
* **Descrição**: Permite controlar uma instância do Google Chrome em modo headless para renderizar páginas, capturar capturas de tela, inspecionar o console e realizar testes de acessibilidade e performance.
* **Principais Ferramentas**:
  * `navigate_page`: Navega para uma URL local ou externa.
  * `take_screenshot`: Captura tela para validação de UI/UX.
  * `lighthouse_audit`: Executa auditorias de performance e Core Web Vitals.
  * `list_console_messages` / `get_runtime_errors`: Depuração de erros em tempo de execução.

### 2. github
* **Descrição**: Conexão com as APIs do GitHub para automação de tarefas no controle de versão.
* **Principais Ferramentas**:
  * `create_branch` / `push_files`: Automação de commits e ramificações.
  * `create_pull_request` / `merge_pull_request`: Integração contínua e revisões.
  * `search_code` / `get_file_contents`: Navegação avançada em repositórios remotos.

### 3. vercel
* **Descrição**: Integração com a Vercel para gerenciamento de deploys e análise de logs em produção.
* **Principais Ferramentas**:
  * `deploy_to_vercel`: Cria novas implantações diretamente do ambiente local.
  * `get_runtime_logs` / `get_runtime_errors`: Monitoramento de falhas no ambiente de staging/produção.

---

## 🧠 Skills Locais Portáveis (`.agents/skills/`)

Para garantir a total portabilidade do Boilerplate e consistência entre diferentes agentes de IA, todas as diretrizes de desenvolvimento foram empacotadas como **skills locais**. 

Abaixo está o inventário de skills portáveis disponíveis na pasta `.agents/skills/`:

| Skill | Descrição / Uso Recomendado |
| :--- | :--- |
| [a11y-micro-acessibilidade](./.agents/skills/a11y-micro-acessibilidade/SKILL.md) | Diretrizes de acessibilidade universal, suporte a leitores de tela e navegação por teclado. |
| [backend-supabase-mastery](./.agents/skills/backend-supabase-mastery/SKILL.md) | Diretrizes estritas para desenvolvimento backend, segurança de dados, Row Level Security (RLS) e integração de Server Actions com Supabase e Zod. |
| [brand](./.agents/skills/brand/SKILL.md) | Manual de tom de voz, copywriting corporativo e consistência de marca. |
| [brand-guidelines](./.agents/skills/brand-guidelines/SKILL.md) | Padrões de design visual e aplicação de cores e tipografia de marca. |
| [core-web-vitals](./.agents/skills/core-web-vitals/SKILL.md) | Otimizações de performance (LCP, FID/INP, CLS) sob arquitetura Next.js. |
| [design](./.agents/skills/design/SKILL.md) | Geração de identidades visuais, SVG customizados e banners corporativos. |
| [design-system](./.agents/skills/design-system/SKILL.md) | Arquitetura de tokens de estilo em três camadas (primitivo -> semântico -> componente). |
| [find-skills](./.agents/skills/find-skills/SKILL.md) | Assistente para encontrar e configurar recursos e novas skills. |
| [frontend-design](./.agents/skills/frontend-design/SKILL.md) | Práticas para fugir de designs genéricos e criar layouts premium e autorais. |
| [mcp-builder](./.agents/skills/mcp-builder/SKILL.md) | Documentação de suporte para construir ou estender novos servidores MCP. |
| [skill-creator](./.agents/skills/skill-creator/SKILL.md) | Recursos para refinar, avaliar e expandir as skills do projeto. |
| [theme-factory](./.agents/skills/theme-factory/SKILL.md) | Sistema de temas visuais e esquemas de paletas harmônicas. |
| [ui-styling](./.agents/skills/ui-styling/SKILL.md) | Uso correto de componentes (ex: shadcn/ui) e boas práticas de CSS utilitário. |
| [ui-ux-pro-max](./.agents/skills/ui-ux-pro-max/SKILL.md) | O guia de design visual de elite da agência (color blocking, micro-animações, etc.). |
| [ux-writing](./.agents/skills/ux-writing/SKILL.md) | Criação de microcopy legível, amigável e focado no usuário. |
| [vercel-react-best-practices](./.agents/skills/vercel-react-best-practices/SKILL.md) | Padrões de arquitetura React e Next.js recomendados pela engenharia da Vercel. |
| [webapp-testing](./.agents/skills/webapp-testing/SKILL.md) | Ferramentas de teste baseadas em Playwright para simulações e auditoria de front-end. |

---

## 📦 Bibliotecas Core & Comandos de Instalação

### 1. Framer Motion
* **Comando de Instalação**: `npm i framer-motion`
* **Descrição**: Biblioteca oficial para todas as interações e transições do projeto.
* **Regra de Ouro**: Para garantir performance e evitar *layout shift* (CLS), o desenvolvedor ou agente de IA deve animar exclusivamente propriedades de composição aceleradas por GPU (`transform`, `opacity`, `scale`). Nunca anime propriedades que forçam o recálculo do layout da página (`width`, `height`, `top`, `left`) em componentes de alta performance.