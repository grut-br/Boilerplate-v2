# Architecture Principles

## P1

A Engine é a única responsável pelas decisões arquiteturais.

Nenhum Provider possui inteligência de negócio.

---

## P2

Toda integração externa ocorre através de Providers.

Nunca diretamente.

---

## P3

Toda ferramenta externa deve ser substituível.

A Engine nunca depende de Graphify, OpenAI ou qualquer tecnologia específica.

---

## P4

Knowledge pertence ao Knowledge Engine.

Nunca ao LLM.

---

## P5

LLMs produzem conteúdo.

Nunca controlam fluxo.

---

## P6

Toda sincronização deve ser Lazy.

Nunca imediata.

---

## P7

O Pipeline permanece determinístico.

---

## P8

A arquitetura sempre possui prioridade sobre otimizações locais.

---

## P9

Código sempre prevalece sobre Prompt.

---

## P10

Toda nova funcionalidade deve preservar o desacoplamento da plataforma.

---

## P11

Todo conhecimento deve possuir origem rastreável.

---

## P12

O Runtime nunca conhece detalhes internos dos Providers.

---

## P13

A Platform deve permanecer agnóstica ao ecossistema.

---

## P14

Toda decisão importante deve gerar uma ADR.

---

## P15

Nenhuma IA pode modificar estes princípios automaticamente.