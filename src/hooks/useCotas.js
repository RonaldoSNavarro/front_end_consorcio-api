import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Gestão de Cotas (REQ-COT-001, REQ-COT-002, REQ-EXC-001, REQ-EXC-002)
 */
export function useCotas() {
  const queryClient = useQueryClient();

  const cotasQuery = useQuery({
    queryKey: ['cotas'],
    queryFn: () => api.cotas.listar(),
  });

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.cotas.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      queryClient.invalidateQueries({ queryKey: ['cotas-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['cotas-grupo'] });
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (id) => api.cotas.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      queryClient.invalidateQueries({ queryKey: ['cotas-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['cotas-grupo'] });
    },
  });

  const reembolsarMutation = useMutation({
    mutationFn: (id) => api.cotas.reembolsar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      queryClient.invalidateQueries({ queryKey: ['reembolsos-excluidos'] });
    },
  });

  return {
    cotas: cotasQuery.data?.content || [],
    isLoading: cotasQuery.isLoading,
    isError: cotasQuery.isError,
    error: cotasQuery.error,
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
    cancelar: cancelarMutation.mutateAsync,
    isCancelando: cancelarMutation.isPending,
    reembolsar: reembolsarMutation.mutateAsync,
    isReembolsando: reembolsarMutation.isPending,
  };
}

/**
 * Hook para cotas associadas a um cliente
 */
export function useCotasPorCliente(clienteId) {
  return useQuery({
    queryKey: ['cotas-cliente', clienteId],
    queryFn: () => api.cotas.listarPorCliente(clienteId),
    enabled: !!clienteId,
  });
}

/**
 * Hook para cotas associadas a um grupo
 */
export function useCotasPorGrupo(grupoId) {
  return useQuery({
    queryKey: ['cotas-grupo', grupoId],
    queryFn: () => api.cotas.listarPorGrupo(grupoId),
    enabled: !!grupoId,
  });
}

/**
 * Hook para obter versões / histórico de alteração de cota
 */
export function useCotaVersoes(cotaId) {
  return useQuery({
    queryKey: ['cotas', cotaId, 'versoes'],
    queryFn: () => api.cotas.listarVersoes(cotaId),
    enabled: !!cotaId,
  });
}

/**
 * Hook para extrato de movimentos de uma cota
 */
export function useCotaMovimentos(cotaId) {
  return useQuery({
    queryKey: ['cotas', cotaId, 'movimentos'],
    queryFn: () => api.cotas.obterMovimentos(cotaId),
    enabled: !!cotaId,
  });
}
