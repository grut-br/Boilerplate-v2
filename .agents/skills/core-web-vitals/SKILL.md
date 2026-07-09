---
name: core-web-vitals
description: Regras e diretrizes rígidas para otimização de performance, alcance de nota 100 no Google Lighthouse e estabilização de Core Web Vitals (LCP, FID/INP, CLS) em aplicações Next.js, React e Tailwind CSS sob Clean Architecture.
metadata:
  author: antigravity
  version: "1.0.0"
---

# Core Web Vitals & Otimização de Performance

Este documento define as regras absolutas e padrões de implementação que devem ser seguidos por todos os agentes de IA e desenvolvedores para garantir o máximo desempenho, estabilização de Core Web Vitals e nota 100 no Google Lighthouse em todas as páginas do boilerplate.

---

## 🎯 Objetivos de Performance
- **LCP (Largest Contentful Paint)**: < 1.2 segundos
- **INP (Interaction to Next Paint) / FID**: < 100 milissegundos
- **CLS (Cumulative Layout Shift)**: 0.0 (Zero)
- **TBT (Total Blocking Time)**: < 150 milissegundos
- **Lighthouse Performance Score**: 100/100 (Ambiente de Produção)

---

## 🛑 Regras Rígidas de Implementação

### 1. Uso Exclusivo do Componente `next/image`
A tag HTML nativa `<img>` está **terminantemente proibida** para renderizar imagens de conteúdo, sob qualquer circunstância.

#### Diretrizes Obrigatórias:
* **Proibição Absoluta**: Nunca utilize `<img>`. Utilize apenas `import Image from 'next/image'`.
* **Imagens do Hero/Acima da Dobra (LCP)**: Devem incluir o atributo `priority` de forma explícita para forçar o pré-carregamento imediato pelo navegador.
* **Layout Shifts (CLS)**: Todas as imagens devem ter dimensões estáticas definidas (`width` e `height`) OU utilizar o atributo `fill`.
* **Uso de `fill`**: Ao usar `fill`, o container pai **deve** possuir posicionamento relativo (`relative`), absoluto (`absolute`) ou fixado (`fixed`), e o atributo `sizes` deve ser configurado corretamente para evitar o download de imagens sobredimensionadas.
* **Formatos Modernos**: O Next.js já converte para WebP/AVIF automaticamente. Assegure que as URLs externas (se houver) estejam cadastradas no `next.config.ts`.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Provoca CLS alto e falta de compressão automática
export function HeroBadge() {
  return <img src="/assets/hero-badge.png" alt="Selo de Qualidade" className="w-12 h-12" />;
}
```

#### Exemplo Correto:
```tsx
import Image from 'next/image';

// Selo estático com dimensões conhecidas
export function HeroBadge() {
  return (
    <Image 
      src="/assets/hero-badge.png" 
      alt="Selo de Qualidade" 
      width={48} 
      height={48}
      className="object-contain"
    />
  );
}

// Banner Responsivo com Prioridade de Carregamento (LCP)
export function HeroBanner() {
  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden">
      <Image 
        src="/images/hero-bg.jpg" 
        alt="Visão panorâmica da plataforma da agência" 
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}
```

---

### 2. Priorização Absoluta de React Server Components (RSC)
A arquitetura do boilerplate baseia-se em Server Components por padrão. A diretiva `"use client"` deve ser tratada como uma exceção regulada.

#### Diretrizes Obrigatórias:
* **RSC por Padrão**: Todas as páginas, layouts e subcomponentes estruturais/dados devem ser Server Components (não usar `"use client"` na raiz ou em níveis altos de árvore).
* **Isolamento de Estado (Componentes Folha)**: Restrinja `"use client"` exclusivamente a componentes interativos "folha" (ex: botões de ação com manipulação de eventos, inputs controlados, modais, dropdowns).
* **Carregamento de Dados**: Sempre faça fetch de APIs ou consultas a bancos de dados diretamente nos Server Components (RSC). Passe os dados primitivos ou entidades como props para os Client Components folha.
* **Layouts Imutáveis**: Mantenha layouts estruturais limpos de qualquer código cliente, permitindo que a casca inicial da página seja transmitida instantaneamente pelo servidor.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ NUNCA marque uma página ou container inteiro como Client Component para buscar dados ou fazer interações pequenas
"use client";

import { useEffect, useState } from 'react';
import { fetchServices } from '@/core/services/api';

export default function ServicesPage() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchServices().then(setData);
  }, []);

  return (
    <main>
      <h1>Nossos Serviços</h1>
      <ul>
        {data.map(service => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

#### Exemplo Correto:
```tsx
// ✅ Server Component (Padrão) busca dados no servidor
import { getServicesUseCase } from '@/core/application/use-cases/get-services';
import { InteractiveFavoriteButton } from './components/interactive-favorite-button';

export default async function ServicesPage() {
  // Chamada de serviço diretamente no backend (RSC)
  const services = await getServicesUseCase.execute();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-6">Nossos Serviços</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(service => (
          <li key={service.id} className="p-4 border rounded-xl bg-card shadow-sm">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p className="text-muted-foreground mt-2">{service.description}</p>
            {/* O componente interativo pequeno é isolado como Client Component */}
            <div className="mt-4 flex justify-end">
              <InteractiveFavoriteButton serviceId={service.id} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

```tsx
// components/interactive-favorite-button.tsx
"use client"; // ✅ Client Component restrito ao nó interativo folha

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface Props {
  serviceId: string;
}

export function InteractiveFavoriteButton({ serviceId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button 
      onClick={() => setIsFavorite(!isFavorite)}
      className="p-2 rounded-full hover:bg-accent transition-colors"
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={isFavorite ? "fill-red-500 stroke-red-500" : "stroke-foreground"} />
    </button>
  );
}
```

---

### 3. Animações Framer Motion Otimizadas por GPU
Animações incorretas causam recalculo de layout (reflow) e repinturas constantes (repaint), gerando queda abrupta na taxa de quadros (FPS) e aumentando o Total Blocking Time (TBT).

#### Diretrizes Obrigatórias:
* **Uso da GPU**: Anime apenas propriedades que podem ser renderizadas diretamente pela placa de vídeo por meio da fase de composição do navegador: `transform` (ex: `scale`, `scaleX`, `scaleY`, `translateX`/`x`, `translateY`/`y`, `rotate`) e `opacity`.
* **Proibição de Propriedades de Layout**: **NUNCA** anime propriedades que forçam o recálculo do fluxo de renderização (ex: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border-width`, `font-size`).
* **Propriedades Físicas**: Se precisar redimensionar elementos visualmente, use `scale` em vez de alterar a largura/altura física.

#### Exemplo Incorreto (Proibido):
```tsx
// ❌ Causa Reflow em cada frame da animação (Trafega pela CPU)
import { motion } from 'framer-motion';

export function SidebarCollapse() {
  return (
    <motion.div 
      initial={{ width: 300 }}
      animate={{ width: 80 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900 overflow-hidden"
    >
      Conteúdo
    </motion.div>
  );
}
```

#### Exemplo Correto:
```tsx
// ✅ Usa apenas GPU para composição (altamente performático)
import { motion } from 'framer-motion';

export function PopoverOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-12 right-0 p-4 bg-popover text-popover-foreground border rounded-lg shadow-lg"
    >
      Conteúdo
    </motion.div>
  );
}
```

---

## 🛠️ Checklist do Agente de IA para Core Web Vitals
Sempre que estiver modificando ou criando novos componentes e views no boilerplate, valide mentalmente este checklist:

1. **[ ]** Há tags `<img>`? Se sim, altere-as imediatamente para o componente `Image` do Next.js.
2. **[ ]** As imagens no topo da página possuem o atributo `priority`?
3. **[ ]** A diretiva `"use client"` foi colocada na raiz do arquivo? Se sim, é possível refatorar movendo a busca de dados e renderização estática para um Server Component, isolando o estado do cliente em subcomponentes folha?
4. **[ ]** As animações do Framer Motion alteram `width`, `height`, `margins`, ou posições absolutas diretas (`top`/`left`)? Se sim, reescreva-as usando `scale` e `x`/`y`.
5. **[ ]** O componente importado via biblioteca externa não suporta SSR? Use `dynamic()` da Next.js com `ssr: false` para evitar dessincronização de hidratação (hydration mismatch) e manter o FCP baixo.
