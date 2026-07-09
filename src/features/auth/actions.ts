"use server";

import { loginSchema, type LoginInput } from "./schemas";
import { ActionState } from "@/lib/action-state";

export async function loginAction(
  data: LoginInput
): Promise<ActionState> {
  // Simular atraso de rede de 1 segundo
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Validação segura com o schema do Zod
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Falha na validação do formulário.",
      errors: fieldErrors as Record<string, string[]>,
    };
  }

  // Simular credenciais válidas para teste de sucesso
  if (data.email === "admin@devio.com.br" && data.senha === "senha123") {
    return {
      success: true,
      message: "Login efetuado com sucesso!",
    };
  }

  return {
    success: false,
    message: "Credenciais inválidas (Dica: utilize admin@devio.com.br / senha123 para simular sucesso).",
  };
}
