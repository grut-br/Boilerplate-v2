---
name: backend-supabase-mastery
description: Diretrizes estritas para desenvolvimento backend, segurança de dados, Row Level Security (RLS) e integração segura de Server Actions com Supabase e Zod no Next.js. Utilize esta skill sempre que criar ou editar Server Actions, realizar consultas ao banco de dados Supabase, criar tabelas SQL, configurar políticas de RLS, ou lidar com tratamento de erros de banco de dados e autenticação no Boilerplate.
---

# Desenvolvimento Seguro com Next.js Server Actions & Supabase

Este documento estabelece as regras arquiteturais e de segurança para manipulação de dados, modelagem de banco de dados e comunicação segura entre cliente e servidor no Boilerplate utilizando Next.js (App Router) e Supabase.

---

## 🎯 Diretrizes de Segurança e Arquitetura

1. **Validação de Entrada Estrita**: Nenhum dado vindo do cliente deve ser aceito ou processado no servidor sem antes passar por uma validação estrita de esquema (schema-based validation).
2. **Prevenção contra Vazamento de Informações**: Mensagens de erro internas de infraestrutura, banco de dados ou biblioteca de persistência nunca devem trafegar de volta para a camada de visualização do usuário.
3. **Isolamento de Persistência**: Componentes do lado do cliente (`"use client"`) não devem ter conexões ou queries de banco de dados embutidas. Eles delegam as mutações e queries interativas para Server Actions controladas.
4. **Proteção Nativa de Dados (RLS)**: Toda e qualquer tabela exposta no banco de dados deve possuir políticas de Row Level Security (RLS) habilitadas e configuradas para evitar acessos transversais não autorizados.

---

## 🛑 Regras Rígidas de Implementação

### 1. Next.js Server Actions Seguras

Toda Server Action implementada no repositório deve obrigatoriamente validar seus parâmetros usando esquemas do Zod e capturar exceções para sanitizar mensagens de erro.

#### Diretrizes Obrigatórias:
* **Validação Inicial**: Execute `safeParse` logo na entrada da action. Se houver falha, retorne os erros estruturados por campo para que o formulário cliente possa renderizá-los.
* **Higienização de Erros**: Utilize blocos `try/catch` ao redor de qualquer chamada externa ou de banco de dados. Se uma exceção ocorrer:
  - Faça o log detalhado no servidor (seguro para auditoria).
  - Retorne ao cliente uma mensagem genérica amigável (ex: *"Não foi possível processar a requisição no momento."*).
* **Tratamento de Estado no Cliente**: Utilize a API padrão do React `useTransition` (ou hooks de gerenciamento de estado compatíveis) no formulário do cliente para gerenciar o estado de processamento (`isPending`) e apresentar feedbacks visuais dinâmicos.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Vazamento de erro do banco de dados e ausência de validação de input
"use server";
import { supabase } from "@/lib/supabase/client";

export async function deletarContaAction(usuarioId: string) {
  // Chamada insegura direta que pode causar sql injection ou deletar registros inválidos
  const { error } = await supabase.from("usuarios").delete().eq("id", usuarioId);
  if (error) {
    throw new Error(error.message); // Retorna stack trace interno e detalhes estruturais do banco
  }
}
```

#### Exemplo Correto:
```tsx
"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

const deletarUsuarioSchema = z.object({
  usuarioId: z.string().uuid({ message: "Identificador de usuário inválido." }),
});

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function deletarContaAction(rawData: unknown): Promise<ActionResponse> {
  // 1. Validação de esquema estrita com Zod
  const result = deletarUsuarioSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      message: "Entrada inválida. Verifique os dados fornecidos.",
    };
  }

  try {
    // 2. Chamada ao banco utilizando cliente unificado
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", result.data.usuarioId);

    if (error) {
      // Registrar log detalhado no servidor para auditoria interna
      console.error("[DELETAR_CONTA_ERROR]:", error);
      
      // Retornar mensagem higienizada e genérica para o cliente
      return {
        success: false,
        message: "Ocorreu um erro interno ao processar a deleção da conta.",
      };
    }

    return {
      success: true,
      message: "Sua conta foi removida com sucesso.",
    };
  } catch (error) {
    console.error("[DELETAR_CONTA_CRITICAL]:", error);
    return {
      success: false,
      message: "Falha crítica de comunicação com o servidor.",
    };
  }
}
```

---

### 2. Supabase & Modelagem de Banco de Dados

Toda e qualquer tabela no banco de dados deve ser modelada pensando em integridade referencial e políticas de RLS habilitadas.

#### Diretrizes Obrigatórias:
* **Row Level Security (RLS)**: Toda tabela deve possuir RLS explicitamente ativo.
  ```sql
  ALTER TABLE public.minha_tabela ENABLE ROW LEVEL SECURITY;
  ```
* **Integridade de Chave Estrangeira**: A criação de relacionamentos via SQL deve sempre definir explicitamente o comportamento na exclusão de chaves estrangeiras utilizando `ON DELETE CASCADE` (para dependências diretas e exclusões em lote) ou `ON DELETE RESTRICT` (para evitar deleção órfã de dados estruturais importantes).
* **Consumo de Cliente Único**: Nunca crie instâncias locais do Supabase usando `createClient` espalhadas no código. Sempre utilize o import unificado de `@/lib/supabase/client` (vinculado a [src/lib/supabase/client.ts](file:///C:/Users/lucas/Projetos/Boilerplate/src/lib/supabase/client.ts)).

#### Exemplo Incorreto (Proibido):
```sql
-- ❌ Tabela sem RLS e chave estrangeira sem regra de exclusão definida
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  autor_id uuid REFERENCES public.usuarios(id)
);
```

#### Exemplo Correto:
```sql
-- ✅ Modelagem estruturada, segura e com RLS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  autor_id uuid NOT NULL,
  
  -- Definição explícita de chave estrangeira com regra de exclusão
  CONSTRAINT fk_autor 
    FOREIGN KEY (autor_id) 
    REFERENCES public.usuarios(id) 
    ON DELETE CASCADE
);

-- Ativação explícita do RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Política de RLS limitando a leitura pública e escrita apenas pelo autor
CREATE POLICY "Permitir leitura pública de posts" 
  ON public.posts FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção e edição apenas pelo próprio autor" 
  ON public.posts FOR ALL 
  USING (auth.uid() = autor_id);
```

---

## 🛠️ Checklist do Agente de IA para Segurança de Dados (Backend)

Sempre que criar ou editar tabelas de banco de dados ou Server Actions, certifique-se de satisfazer os seguintes critérios:

1. **[ ]** A Server Action valida os dados de entrada usando o método `safeParse` de um schema Zod?
2. **[ ]** O tratamento de erro da Action intercepta exceções cruas do banco de dados e retorna mensagens higienizadas para o cliente?
3. **[ ]** O componente visual cliente utiliza `useTransition` para controlar os loaders e impedir ações concorrentes do usuário?
4. **[ ]** As tabelas criadas possuem habilitadas explicitamente as diretrizes de Row Level Security (RLS)?
5. **[ ]** Todas as referências de chaves estrangeiras declaram regras estritas de `ON DELETE CASCADE` ou `ON DELETE RESTRICT`?
6. **[ ]** Toda interação com o banco de dados é importada do cliente unificado em [src/lib/supabase/client.ts](file:///C:/Users/lucas/Projetos/Boilerplate/src/lib/supabase/client.ts)?
