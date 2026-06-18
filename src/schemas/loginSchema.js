import { z } from 'zod';

/**
 * Schema Zod — Autenticação (REQ-AUTH-001)
 * Validação client-side do formulário de login.
 */
export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  senha: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
