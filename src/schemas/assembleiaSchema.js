import { z } from 'zod';

/**
 * Schema Zod — Agendamento de Assembleia (REQ-ASM-001, REQ-ASM-002)
 * Validação client-side para criação de assembleias ordinárias.
 */
export const assembleiaSchema = z.object({
  grupoId: z.coerce
    .number({ required_error: 'Grupo é obrigatório' })
    .positive('ID do grupo deve ser positivo'),
  dataAssembleia: z
    .string()
    .min(1, 'Data da assembleia é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Data da assembleia deve ser presente ou futura'),
  tipo: z
    .enum(['ORDINARIA', 'EXTRAORDINARIA'], {
      errorMap: () => ({ message: 'Tipo deve ser ORDINARIA ou EXTRAORDINARIA' }),
    })
    .default('ORDINARIA'),
});
