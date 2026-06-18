import { describe, it, expect } from 'vitest';
import { loginSchema } from '../schemas/loginSchema';
import { assembleiaSchema } from '../schemas/assembleiaSchema';
import { lanceSchema } from '../schemas/lanceSchema';
import { parcelaSchema } from '../schemas/parcelaSchema';
import { reajusteSchema } from '../schemas/reajusteSchema';
import { pagamentoSchema } from '../schemas/pagamentoSchema';

describe('Validação de Schemas Zod', () => {
  describe('loginSchema (REQ-AUTH-001)', () => {
    it('deve validar credenciais corretas', () => {
      const validData = { login: 'admin@dev.com', senha: 'password123' };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar e-mail inválido', () => {
      const invalidData = { login: 'invalido-email', senha: 'password123' };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha muito curta', () => {
      const invalidData = { login: 'admin@dev.com', senha: '123' };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('assembleiaSchema (REQ-ASM-001, REQ-ASM-002)', () => {
    it('deve validar assembleia válida', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const validData = { grupoId: 12, dataAssembleia: tomorrowStr, tipo: 'ORDINARIA' };
      const result = assembleiaSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar data retroativa', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const invalidData = { grupoId: 12, dataAssembleia: yesterdayStr, tipo: 'ORDINARIA' };
      const result = assembleiaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar ID de grupo negativo', () => {
      const invalidData = { grupoId: -1, dataAssembleia: '2026-12-12', tipo: 'ORDINARIA' };
      const result = assembleiaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('lanceSchema (REQ-LAN-001, REQ-LAN-002, REQ-LAN-004)', () => {
    it('deve validar lance livre com valor positivo', () => {
      const validData = { cotaId: 1, assembleiaId: 2, tipo: 'EMBUTIDO', modalidade: 'LIVRE', valorOferta: 5000.00 };
      const result = lanceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar lance livre com valor zero', () => {
      const invalidData = { cotaId: 1, assembleiaId: 2, tipo: 'EMBUTIDO', modalidade: 'LIVRE', valorOferta: 0 };
      const result = lanceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve aceitar lance fixo com valor zero (calculado pelo backend)', () => {
      const validData = { cotaId: 1, assembleiaId: 2, tipo: 'FIRME', modalidade: 'FIXO', valorOferta: 0 };
      const result = lanceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('parcelaSchema (REQ-FUN-001, REQ-FUN-002, REQ-SEG-001)', () => {
    it('deve validar parcela correta', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const validData = {
        cotaId: 1,
        numeroParcela: 5,
        valorFundoComum: 1000.00,
        valorTaxaAdministracao: 150.00,
        valorFundoReserva: 20.00,
        valorSeguro: 50.00,
        dataVencimento: tomorrowStr
      };
      const result = parcelaSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar valores financeiros negativos', () => {
      const invalidData = {
        cotaId: 1,
        numeroParcela: 5,
        valorFundoComum: -100.00,
        valorTaxaAdministracao: 150.00,
        valorFundoReserva: 20.00,
        valorSeguro: 50.00,
        dataVencimento: '2026-12-12'
      };
      const result = parcelaSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('reajusteSchema (REQ-ENC-001)', () => {
    it('deve validar valor de crédito positivo', () => {
      const result = reajusteSchema.safeParse({ novoValorCredito: 150000.00 });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar valor negativo ou zero', () => {
      expect(reajusteSchema.safeParse({ novoValorCredito: 0 }).success).toBe(false);
      expect(reajusteSchema.safeParse({ novoValorCredito: -100 }).success).toBe(false);
    });
  });

  describe('pagamentoSchema (REQ-INA-001)', () => {
    it('deve validar data de pagamento válida', () => {
      const result = pagamentoSchema.safeParse({ dataPagamento: '2026-06-15' });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar data vazia', () => {
      const result = pagamentoSchema.safeParse({ dataPagamento: '' });
      expect(result.success).toBe(false);
    });
  });
});
