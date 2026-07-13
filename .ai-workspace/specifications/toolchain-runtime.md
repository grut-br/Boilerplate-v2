# Especificação do Toolchain Runtime — V3.0

Este documento define oficialmente a especificação de processamento do **Toolchain Gateway** em tempo de execução, detalhando a esteira de auditoria física de código e as regras de rollback.

---

## ⚡ Validation Pipeline (Pipeline de Validação)

O pipeline de verificação física de código-fonte ocorre sob a seguinte sequência linear e determinística de 7 etapas de validação:

```text
Código Editado pela Execution Engine
   │
   ├──> 1. Início de Processamento no Toolchain Gateway
   │
   ├──> 2. Execução do Linting (Verifica formatação e regras estáticas do React)
   │
   ├──> 3. Type Checking (TypeScript compiler valida tipagem e importações)
   │
   ├──> 4. Production Build (Next.js build valida rotas e carregamento estático)
   │
   ├──> 5. Regression Tests (Executa testes unitários ou de integração se houver)
   │
   ├──> 6. Coverage & Metrics (Verifica cobertura de código exigida)
   │
   └──> Resultado (Homologado PASS ou Reversão FAIL com relatórios de logs)
```

---

## 🧭 Funcionamento e Processamento do Runtime

### 1. Recepção das Alterações
Assim que a Execution Engine encerra a gravação física de código em um arquivo local, ela notifica o Toolchain Gateway enviando a lista de arquivos criados ou modificados.

### 2. Execução de Validações Estritas
O Gateway dispara localmente os validadores instalados na máquina do desenvolvedor (através de comandos de terminal gerenciados de forma síncrona). A validação segue a regra de **Fail-Fast** (qualquer erro que ocorra em uma etapa aborta imediatamente as validações posteriores).

### 3. Emissão de Relatório Estruturado
O Gateway analisa os logs de saída do terminal:
* **Sucesso (PASS):** Se todas as etapas executarem sem erros (código de saída zero), um relatório de aprovação é gerado e o estado da tarefa é atualizado para concluído.
* **Falha (FAIL):** Se algum validador emitir erros (código de saída diferente de zero), o Gateway intercepta os logs brutos, filtra avisos (warnings) irrelevantes de pacotes externos e compila apenas a linha de código e a descrição do erro de compilação em um JSON estruturado.

### 4. Interrupção e Rollback Automático
Se a validação falhar, a Engine interrompe a esteira. Dependendo da gravidade e do número de retentativas:
* **Correção em turnos (Self-Healing):** O relatório de erros refinados é enviado à Execution Engine para que ela corrija o bug de digitação/sintaxe em uma nova rodada.
* **Rollback Físico:** Se as retentativas esgotarem ou em caso de erro crítico que corrompa o build global, a Engine dispara um comando de restauração de estado do repositório, apagando as modificações físicas e retornando o código-fonte ao último estado consistente do Runtime State.
