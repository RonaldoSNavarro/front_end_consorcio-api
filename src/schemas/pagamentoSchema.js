import { z } from 'zod';

/**
 * Schema Zod — Pagamento de Parcela (REQ-INA-001)
 * Validação client-side para registro de pagamento com data efetiva.
 */
export const pagamentoSchema = z.object({
  dataPagamento: z
    .string()
    .min(1, 'Data de pagamento é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Data de pagamento inválida'),
});
