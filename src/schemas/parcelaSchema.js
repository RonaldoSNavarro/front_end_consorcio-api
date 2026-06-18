import { z } from 'zod';

/**
 * Schema Zod — Criação de Parcela (REQ-FUN-001, REQ-FUN-002, REQ-SEG-001)
 * Validação client-side para geração de parcelas com todos os componentes
 * financeiros: Fundo Comum, Taxa de Administração, Fundo de Reserva e Seguro.
 */
export const parcelaSchema = z.object({
  cotaId: z.coerce
    .number({ required_error: 'Cota é obrigatória' })
    .positive('ID da cota deve ser positivo'),
  numeroParcela: z.coerce
    .number({ required_error: 'Número da parcela é obrigatório' })
    .positive('Número da parcela deve ser positivo'),
  valorFundoComum: z.coerce
    .number({ required_error: 'Fundo Comum é obrigatório' })
    .positive('Fundo Comum deve ser positivo'),
  valorTaxaAdministracao: z.coerce
    .number({ required_error: 'Taxa de Administração é obrigatória' })
    .positive('Taxa de Administração deve ser positiva'),
  valorFundoReserva: z.coerce
    .number({ required_error: 'Fundo de Reserva é obrigatório' })
    .positive('Fundo de Reserva deve ser positivo'),
  valorSeguro: z.coerce
    .number({ required_error: 'Seguro é obrigatório' })
    .min(0, 'Valor de seguro não pode ser negativo'),
  dataVencimento: z
    .string()
    .min(1, 'Data de vencimento é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Data de vencimento deve ser presente ou futura'),
});
