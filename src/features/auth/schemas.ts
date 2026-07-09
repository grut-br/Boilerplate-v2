import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Insira um endereço de e-mail válido." }),
  senha: z.string().min(6, { message: "A senha deve conter pelo menos 6 caracteres." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
