import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Gestão de Grupos (REQ-GRU-001, REQ-GRU-002, REQ-ENC-001, REQ-ENC-002)
 */
export function useGrupos() {
  const queryClient = useQueryClient();

  const gruposQuery = useQuery({
    queryKey: ['grupos'],
    queryFn: () => api.grupos.listar(),
  });

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.grupos.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const inaugurarMutation = useMutation({
    mutationFn: ({ id, dataAssembleia }) => api.grupos.inaugurar(id, dataAssembleia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const reajustarMutation = useMutation({
    mutationFn: ({ id, novoValorCredito }) => api.grupos.reajustar(id, novoValorCredito),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const encerrarMutation = useMutation({
    mutationFn: (id) => api.grupos.encerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  return {
    grupos: gruposQuery.data?.content || [],
    isLoading: gruposQuery.isLoading,
    isError: gruposQuery.isError,
    error: gruposQuery.error,
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
    inaugurar: inaugurarMutation.mutateAsync,
    isInaugurando: inaugurarMutation.isPending,
    reajustar: reajustarMutation.mutateAsync,
    isReajustando: reajustarMutation.isPending,
    encerrar: encerrarMutation.mutateAsync,
    isEncerrando: encerrarMutation.isPending,
  };
}

/**
 * Hook para obter dados financeiros de um grupo (REQ-FUN-003)
 */
export function useGrupoFinanceiro(grupoId) {
  return useQuery({
    queryKey: ['grupos', grupoId, 'financeiro'],
    queryFn: () => api.grupos.obterFinanceiro(grupoId),
    enabled: !!grupoId,
  });
}

/**
 * Hook para obter movimentos de um grupo (extrato ledger)
 */
export function useGrupoMovimentos(grupoId) {
  return useQuery({
    queryKey: ['grupos', grupoId, 'movimentos'],
    queryFn: () => api.grupos.obterMovimentos(grupoId),
    enabled: !!grupoId,
  });
}

/**
 * Hook para obter saldo de um grupo
 */
export function useGrupoSaldo(grupoId) {
  return useQuery({
    queryKey: ['grupos', grupoId, 'saldo'],
    queryFn: () => api.grupos.obterSaldo(grupoId),
    enabled: !!grupoId,
  });
}


