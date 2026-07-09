# Devio Boilerplate - System Rules

1. **Next.js & React**: Você está operando em Next.js 16.2+. Sempre priorize Server Components. O uso de "use client" deve ser mínimo e justificado.
2. **Arquitetura**: Jamais importe Header ou Footer em páginas (`page.tsx`). Eles são injetados globalmente pelo `layout.tsx`.
3. **Estilização**: Use apenas Tailwind v4. Não crie CSS global desnecessário.
4. **Skills**: Antes de qualquer tarefa, leia os arquivos na pasta `.agents/skills/` para garantir que o design e a acessibilidade estejam conforme o padrão da agência.
5. **Contexto**: Sempre consulte o arquivo `AI_ARSENAL.md` na raiz para saber quais ferramentas (MCPs) estão disponíveis para uso.