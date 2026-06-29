import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../services/api';
import { useClientes } from '../hooks/useClientes';
import { useGrupos } from '../hooks/useGrupos';
import { useCotasPorCliente } from '../hooks/useCotas';
import { useAssembleias } from '../hooks/useAssembleias';
import { useParcelas, useInadimplencia } from '../hooks/useParcelas';
import { useLances } from '../hooks/useLances';
import { useContemplacoes } from '../hooks/useContemplacoes';

vi.mock('../services/api', () => ({
  api: {
    clientes: {
      listar: vi.fn().mockResolvedValue({ content: [{ id: 1, nome: 'João' }] }),
      salvar: vi.fn().mockResolvedValue({ id: 2, nome: 'Maria Julia' })
    },
    grupos: {
      listar: vi.fn().mockResolvedValue({ content: [{ id: 1, valorCredito: 50000 }] }),
      reajustar: vi.fn().mockResolvedValue({ id: 1, valorCredito: 70000.00 })
    },
    cotas: {
      listarPorCliente: vi.fn().mockResolvedValue({ content: [{ id: 1 }] })
    },
    assembleias: {
      salvar: vi.fn().mockResolvedValue({ id: 1, dataAssembleia: '2026-10-10' })
    },
    parcelas: {
      obterInadimplenciaCota: vi.fn().mockResolvedValue({ data: { cotaId: 1 } }),
      pagar: vi.fn().mockResolvedValue({ id: 2, status: 'PAGA' })
    },
    lances: {
      salvar: vi.fn().mockResolvedValue({ id: 1, valorOferta: 5000.00 })
    },
    contemplacoes: {
      registrar: vi.fn().mockResolvedValue({ id: 1, tipoContemplacao: 'SORTEIO' })
    }
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Testes unitários de Hooks TanStack Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useClientes', () => {
    it('deve listar clientes', async () => {
      const { result } = renderHook(() => useClientes(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.clientes.length).toBeGreaterThan(0);
    });

    it('deve cadastrar um novo cliente', async () => {
      const { result } = renderHook(() => useClientes(), { wrapper: createWrapper() });
      const novoCliente = { nome: 'Maria Julia' };
      let cadastrado;
      await waitFor(async () => {
        cadastrado = await result.current.salvar(novoCliente);
      });
      expect(cadastrado.nome).toBe('Maria Julia');
    });
  });

  describe('useGrupos', () => {
    it('deve listar grupos cadastrados', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
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
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeDefined();
    });
  });

  describe('useAssembleias', () => {
    it('deve agendar uma assembleia', async () => {
      const { result } = renderHook(() => useAssembleias(1), { wrapper: createWrapper() });
      let novaAssembleia;
      await waitFor(async () => {
        novaAssembleia = await result.current.salvar({ grupoId: 1, dataAssembleia: '2026-10-10' });
      });
      expect(novaAssembleia.id).toBeDefined();
    });
  });

  describe('useParcelas', () => {
    it('deve buscar inadimplência da cota', async () => {
      const { result } = renderHook(() => useInadimplencia(1), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeDefined();
    });

    it('deve registrar pagamento de parcela', async () => {
      const { result } = renderHook(() => useParcelas(1), { wrapper: createWrapper() });
      let parcelaPaga;
      await waitFor(async () => {
        parcelaPaga = await result.current.pagar({ id: 2, dataPagamento: '2026-06-17' });
      });
      expect(parcelaPaga.status).toBe('PAGA');
    });
  });

  describe('useLances', () => {
    it('deve cadastrar proposta de lance', async () => {
      const { result } = renderHook(() => useLances(), { wrapper: createWrapper() });
      let lanceCriado;
      await waitFor(async () => {
        lanceCriado = await result.current.salvar({ valorOferta: 5000.00 });
      });
      expect(lanceCriado.valorOferta).toBe(5000.00);
    });
  });

  describe('useContemplacoes', () => {
    it('deve registrar contemplacao por sorteio', async () => {
      const { result } = renderHook(() => useContemplacoes(1), { wrapper: createWrapper() });
      let contemplacao;
      await waitFor(async () => {
        contemplacao = await result.current.registrar({ tipoContemplacao: 'SORTEIO' });
      });
      expect(contemplacao.tipoContemplacao).toBe('SORTEIO');
    });
  });
});
