# Workflow: Desenvolvimento de CRUD

## 🎯 Objetivo
Fornecer um roteiro impenetrável e progressivo para a edificação de sistemas CRUD (Create, Read, Update, Delete). A meta é cristalizar a segurança ponta a ponta, integridade lógica e total separação arquitetural da visão em relação às regras de armazenamento de dados.

## 📊 Classificação da Tarefa
Este workflow aplica-se estritamente a tarefas de nível **Feature** ou **Small Feature** que envolvem modelagens relacionais completas. Se a manutenção do CRUD for uma pequena correção cosmética ou alteração de texto (Micro Task), utilize o fluxo **Fast Track** simplificado.

## 📦 O Conceito de Work Unit
A complexidade natural de manipulações de entidades nunca deve ser processada em bloco monolítico. Ela é obrigatoriamente segmentada em camadas estruturais através do processo de **Work Units**.
* **O que é:** Uma fatia isolada e autossuficiente focada num único vetor do CRUD dentro de um plano arquitetural particular.
* **Como criar:** Segregando e isolando as fases da comunicação. Exemplo: Para materializar um "Cadastro de Cliente" (C do CRUD), geram-se as Work Units: 1. Modelagem Persistente (tabelas); 2. Lógica Controladora do Servidor; 3. Painel Visual (Interface Frontend); 4. Elo de Integração.
* **Qual o tamanho ideal:** Um degrau que possa ser totalmente certificado antes que o escopo dependente dele sequer exista em código.
* **Como dividir Features grandes:** Todo o pacote CRUD se despedaça incialmente em verticais de ação (Criar, Ler, Modificar, Destruir). E para cada uma dessas, abrem-se os vetores em sub-unidades (Dados, Segurança, Lógica, Renderização).
* **Quando termina:** Quando a operação exibe comportamento perfeito no isolamento (testes pontuais isolados) e rejeita agressivamente tentativas de quebra.
* **Como registrar:** Documentando passo a passo a conquista da camada na matriz do `PROJECT_STATE.md`.

## 🔄 Ordem Completa das Etapas (Fluxo)
1. **Especificação:** Clarificar os modelos de dados. O que entra? Qual formato? Como se relaciona? O que não pode ser gravado? Quem tem permissão de leitura?
2. **Modelagem:** Criação representativa dos dados em infraestrutura e definição das amarras estáticas via schemas e mapeamentos rigorosos. 
3. **Banco (Data Layer & Security):** Instanciação do recurso físico ou provedor abstrato. É mandatório aplicar regras profundas de isolamento, garantindo políticas defensivas e negações por padrão na proteção direta aos recursos sensíveis.
4. **Backend (Logics & Actions):** Criação dos controladores. Toda entrada deve sofrer sanitização pesada usando schemas e garantias de tipagem. Esse controlador deve ser blindado a falhas físicas do banco, capturando e suavizando mensagens e convertendo em repostas consistentes.
5. **Frontend (View & Interface):** Desenvolvimento do visual (Painéis, Tabelas, Formulários). A interface é considerada de baixa inteligência perante os dados; ela não cria regras de integridade, ela apenas obedece aos schemas estritos, despacha interações e geria estados otimizados de resposta e carregamento.
6. **Validação (Sanity Checks):** Cruzamento das fronteiras forçando cenários adversos: inserção de formatos nulos, dados agigantados, colunas duplicadas. Tudo deve refletir o erro elegantemente na interface.
7. **Testes:** Bateria contínua e incisiva sobre os caminhos ideais (Happy Path) e sobre as respostas à corrupções lógicas.
8. **Documentação:** Alinhamento retroativo das deliberações e possíveis mudanças de esquema tomadas no trajeto, formalizando tudo no registro.
9. **Conclusão:** Fechamento e sinalização da operação CRUD completada com excelência.

## 🏁 Detalhamento Estratégico & Segurança
* **Desconfiança Crônica (Zero Trust):** O Controlador/Backend tem por premissa jamais confiar nos pacotes providos pelo Frontend (mesmo em ambientes do mesmo domínio). Repasses em nu devem colidir contra barreiras implacáveis de validação tipada de schema previamente à passagem para a camada física.
* **Isolamento de Erros:** Exceções sujas derivadas diretamente de falhas nativas do sistema de banco de dados não possuem autorização de transitar livremente até a visão do cliente, prevenindo assim rastreios sensíveis por atores mal-intencionados. O servidor deve traduzir as interrupções de rotina em linguagem sanitizada e padronizada.
* **Integração Ascendente:** Trabalha-se unicamente de baixo para cima. Modele. Valide a Modelagem. Proteja a tabela. Escreva a injeção em controlador manual sem interface, chame de forma mockada e observe. Só inicie a parte gráfica após todo o esqueleto interno estar robusto.
