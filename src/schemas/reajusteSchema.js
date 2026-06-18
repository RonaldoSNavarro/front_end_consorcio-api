import { z } from 'zod';

/**
 * Schema Zod — Reajuste do Crédito do Grupo (REQ-ENC-001)
 * Validação client-side para atualização do valor do bem de referência.
 */
export const reajusteSchema = z.object({
  novoValorCredito: z.coerce
    .number({ required_error: 'Novo valor do crédito é obrigatório' })
    .positive('Valor do crédito deve ser positivo'),
});
