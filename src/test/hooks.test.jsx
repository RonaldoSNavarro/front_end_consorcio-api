import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../services/api';
import { useClientes } from '../hooks/useClientes';
import { useGrupos } from '../hooks/useGrupos';
import { useCotas, useCotasPorCliente } from '../hooks/useCotas';
import { useAssembleias } from '../hooks/useAssembleias';
import { useParcelas, useInadimplencia } from '../hooks/useParcelas';
import { useLances } from '../hooks/useLances';
import { useContemplacoes } from '../hooks/useContemplacoes';

// Helper wrapper to supply TanStack Query Client
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Testes unitários de Hooks TanStack Query', () => {
  beforeEach(() => {
    localStorage.clear();
    api.setMockMode(true);
  });

  describe('useClientes', () => {
    it('deve listar clientes no modo simulado', async () => {
      const { result } = renderHook(() => useClientes(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clientes.length).toBeGreaterThan(0);
      expect(result.current.isMock).toBe(true);
    });

    it('deve cadastrar um novo cliente', async () => {
      const { result } = renderHook(() => useClientes(), { wrapper: createWrapper() });

      const novoCliente = {
        nome: 'Maria Julia',
        cpfCnpj: '22233344455',
        email: 'maria@dev.com',
        telefone: '11912345678',
        cep: '01310100',
        patrimonio: 150000,
        rendaMensal: 6000,
        nivelRisco: 'MEDIO'
      };

      let cadastrado;
      await waitFor(async () => {
        cadastrado = await result.current.salvar(novoCliente);
      });

      expect(cadastrado.id).toBeDefined();
      expect(cadastrado.nome).toBe('Maria Julia');
    });
  });

  describe('useGrupos', () => {
    it('deve listar grupos cadastrados', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.grupos.length).toBeGreaterThan(0);
    });

    it('deve reajustar o crédito do grupo', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper: createWrapper() });

      let grupoReajustado;
      await waitFor(async () => {
        grupoReajustado = await result.current.reajustar({ id: 1, novoValorCredito: 70000.00 });
      });

      expect(grupoReajustado.valorCredito).toBe(70000.00);
    });
  });

  describe('useCotas', () => {
    it('deve retornar cotas do grupo', async () => {
      const { result } = renderHook(() => useCotasPorCliente(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useAssembleias', () => {
    it('deve agendar uma assembleia', async () => {
      const { result } = renderHook(() => useAssembleias(1), { wrapper: createWrapper() });

      const dataStr = '2026-10-10';
      let novaAssembleia;
      await waitFor(async () => {
        novaAssembleia = await result.current.salvar({ grupoId: 1, dataAssembleia: dataStr, tipo: 'ORDINARIA' });
      });

      expect(novaAssembleia.id).toBeDefined();
      expect(novaAssembleia.dataAssembleia).toBe(dataStr);
    });
  });

  describe('useParcelas', () => {
    it('deve buscar inadimplência da cota', async () => {
      const { result } = renderHook(() => useInadimplencia(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data.data.cotaId).toBe(1);
    });

    it('deve registrar pagamento de parcela', async () => {
      const { result } = renderHook(() => useParcelas(1), { wrapper: createWrapper() });

      let parcelaPaga;
      await waitFor(async () => {
        parcelaPaga = await result.current.pagar({ id: 2, dataPagamento: '2026-06-17' });
      });

      expect(parcelaPaga.status).toBe('PAGA');
      expect(parcelaPaga.valorPago).toBeGreaterThan(0);
    });
  });

  describe('useLances', () => {
    it('deve cadastrar proposta de lance', async () => {
      const { result } = renderHook(() => useLances(), { wrapper: createWrapper() });

      let lanceCriado;
      await waitFor(async () => {
        lanceCriado = await result.current.salvar({
          cotaId: 1,
          assembleiaId: 1,
          tipo: 'EMBUTIDO',
          modalidade: 'LIVRE',
          valorOferta: 5000.00
        });
      });

      expect(lanceCriado.id).toBeDefined();
      expect(lanceCriado.valorOferta).toBe(5000.00);
    });
  });

  describe('useContemplacoes', () => {
    it('deve registrar contemplacao por sorteio', async () => {
      // Paga a parcela 6 (Cota 2) para torná-la adimplente e elegível
      await api.parcelas.pagar(6, '2026-06-05');

      // Modifica temporariamente o valor do crédito do grupo 1 no localStorage para caber no caixa do simulador
      const db = JSON.parse(localStorage.getItem('consorcio_api_mock_db') || '{}');
      const grupo1 = db.grupos.find(g => g.id === 1);
      const originalCredito = grupo1.valorCredito;
      grupo1.valorCredito = 100.00;
      localStorage.setItem('consorcio_api_mock_db', JSON.stringify(db));

      const { result } = renderHook(() => useContemplacoes(1), { wrapper: createWrapper() });

      let contemplacao;
      await waitFor(async () => {
        contemplacao = await result.current.registrar({
          cotaId: 2, // cota 2 está ativa no grupo 1
          assembleiaId: 1,
          tipoContemplacao: 'SORTEIO',
          valorLance: 0,
          lanceEmbutido: false
        });
      });

      // Restaura o valor original
      const dbRestored = JSON.parse(localStorage.getItem('consorcio_api_mock_db') || '{}');
      const grupo1Restored = dbRestored.grupos.find(g => g.id === 1);
      if (grupo1Restored) {
        grupo1Restored.valorCredito = originalCredito;
        localStorage.setItem('consorcio_api_mock_db', JSON.stringify(dbRestored));
      }

      expect(contemplacao.id).toBeDefined();
      expect(contemplacao.tipoContemplacao).toBe('SORTEIO');
    });
  });
});
