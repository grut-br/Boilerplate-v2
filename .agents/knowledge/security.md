# Segurança da Informação (Security)

Este documento rege a filosofia de proteção de dados, acessos e integridade do software. A segurança deve ser tratada como parte integrante do ciclo de vida de cada Work Unit, nunca como uma etapa final de validação.

## 🔒 Princípios de Segurança

### 1. Princípio do Menor Privilégio
* Por padrão, toda conta, serviço, processo e usuário deve ter acesso apenas aos recursos estritamente necessários para desempenhar sua função.
* O acesso de escrita e leitura de dados deve ser restrito no nível mais baixo possível do armazenamento (ex: políticas de Row Level Security).

### 2. Validação e Sanitização de Entradas (Input Validation)
* **Nunca Confie na Origem:** Todos os dados provenientes de fontes externas (interfaces de usuário, integrações, cookies, parâmetros de URL) devem ser considerados hostis.
* **Validação Estrita:** Valide tipos de dados, formatos, limites de tamanho e valores permitidos na porta de entrada lógica do servidor.
* **Sanitização:** Limpe dados brutos antes de persistir ou utilizá-los em exibições dinâmicas para neutralizar injeções de scripts ou tags perigosas.

### 3. Autenticação e Autorização Seguras
* **Autenticação:** Processo rigoroso de identificação de quem está acessando o sistema. A sessão do usuário deve ser mantida de forma segura e resistente a roubos de credenciais.
* **Autorização:** Verificação contínua e no servidor de que o usuário autenticado possui permissão para executar a ação solicitada, protegendo contra acessos diretos a identificadores (IDOR).

### 4. Exposição de Dados
* Nunca exponha chaves privadas de serviços terceiros, credenciais administrativas ou identificadores internos sensíveis nos pacotes enviados ao lado do cliente.
* Mascare informações sensíveis (ex: emails, documentos pessoais) e use IDs não sequenciais no trânsito público.

### 5. Tratamento de Erros e Logs Seguros
* Erros do sistema devem falhar de forma segura. Mensagens de erro visíveis ao usuário final devem ser genéricas e amigáveis.
* Logs técnicos detalhados devem residir em canais internos isolados e nunca conter informações pessoais identificáveis (PII) ou credenciais.
