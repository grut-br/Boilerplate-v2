"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    errors?: {
      email?: string[];
      senha?: string[];
    };
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await loginAction({ email, senha });

        if (response.success) {
          setFeedback({
            type: "success",
            message: response.message,
          });
          // Resetar campos
          setEmail("");
          setSenha("");
        } else {
          setFeedback({
            type: "error",
            message: response.message,
            errors: response.errors,
          });
        }
      } catch {
        setFeedback({
          type: "error",
          message: "Ocorreu um erro inesperado ao processar o login.",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <LogIn className="h-5 w-5 text-violet-500" />
          Área de Acesso
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Teste o formulário de login acoplado às Server Actions do módulo de Auth.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2 flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-zinc-500" />
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@devio.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
            disabled={isPending}
          />
          {feedback?.errors?.email && (
            <span className="text-xs text-red-500 mt-1">
              {feedback.errors.email[0]}
            </span>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2 flex flex-col">
          <label htmlFor="senha" className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-zinc-500" />
            Senha
          </label>
          <input
            id="senha"
            type="password"
            placeholder="••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
            disabled={isPending}
          />
          {feedback?.errors?.senha && (
            <span className="text-xs text-red-500 mt-1">
              {feedback.errors.senha[0]}
            </span>
          )}
        </div>

        {/* Mensagens de Feedback */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-lg p-4 text-sm flex items-start gap-2.5 ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/25 text-red-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {feedback.type === "success" ? "Acesso Autorizado" : "Falha no Acesso"}
                </p>
                <p className="mt-0.5 text-xs opacity-90">{feedback.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  );
}
