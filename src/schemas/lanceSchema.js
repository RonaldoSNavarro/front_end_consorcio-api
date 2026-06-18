import { z } from 'zod';

/**
 * Schema Zod — Oferta de Lance (REQ-LAN-001, REQ-LAN-002, REQ-LAN-004)
 * Validação client-side para cadastro de propostas de lance.
 * O valor é condicionalmente obrigatório: para FIXO é calculado pelo backend,
 * para LIVRE deve ser positivo e informado pelo operador.
 */
export const lanceSchema = z.object({
  cotaId: z.coerce
    .number({ required_error: 'Cota é obrigatória' })
    .positive('ID da cota deve ser positivo'),
  assembleiaId: z.coerce
    .number({ required_error: 'Assembleia é obrigatória' })
    .positive('ID da assembleia deve ser positivo'),
  tipo: z.enum(['EMBUTIDO', 'FIRME', 'MISTO'], {
    errorMap: () => ({ message: 'Tipo deve ser EMBUTIDO, FIRME ou MISTO' }),
  }),
  modalidade: z.enum(['LIVRE', 'FIXO'], {
    errorMap: () => ({ message: 'Modalidade deve ser LIVRE ou FIXO' }),
  }),
  valorOferta: z.coerce
    .number({ required_error: 'Valor da oferta é obrigatório' })
    .min(0, 'Valor da oferta não pode ser negativo'),
}).refine(
  (data) => {
    // Para lance LIVRE, valor deve ser estritamente positivo
    if (data.modalidade === 'LIVRE' && data.valorOferta <= 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Para lance livre, o valor da oferta deve ser maior que zero',
    path: ['valorOferta'],
  }
);
