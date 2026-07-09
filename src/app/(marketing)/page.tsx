"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Layers, Cpu, Paintbrush } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const caracteristicas = [
    {
      icon: Layers,
      title: "Herança DRY",
      description: "Layouts estruturados de forma limpa onde componentes globais persistem sem repetição.",
    },
    {
      icon: Cpu,
      title: "Desempenho",
      description: "Construído sobre o Next.js 16 com o novo React 19 para velocidade máxima e SEO otimizado.",
    },
    {
      icon: Paintbrush,
      title: "Tailwind v4 & Motion",
      description: "Animações fluidas baseadas em física combinadas com a elegância do novo Tailwind CSS.",
    },
  ];

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-black px-6 py-24 sm:py-32">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[60%] right-[10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
        {/* Badge animada */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4.5 py-1.5 text-xs sm:text-sm font-medium text-violet-400 backdrop-blur-sm"
        >
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          <span>Versão 1.0.0 Lançada</span>
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-500"
        >
          Devio Master Boilerplate
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed"
        >
          Fundação pronta para o próximo projeto. Desenvolva sites institucionais ultra velozes, bonitos e extremamente profissionais em minutos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4.5"
        >
          <Link
            href="#servicos"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all duration-300 shadow-lg shadow-violet-500/25 hover:-translate-y-0.5"
          >
            Começar Agora
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="https://github.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
          >
            Documentação
          </Link>
        </motion.div>
      </div>

      {/* Grid de Características */}
      <div className="mx-auto mt-20 max-w-5xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {caracteristicas.map((carac, index) => {
            const Icon = carac.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                className="group relative rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-sm hover:border-violet-500/20 hover:bg-zinc-900/60 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{carac.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300 leading-relaxed">
                  {carac.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
