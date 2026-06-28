import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Apuração e Contemplações (REQ-CON-001, REQ-CON-002, REQ-CON-003, REQ-CON-004, REQ-CON-006)
 */
export function useContemplacoes(assembleiaId) {
  const queryClient = useQueryClient();

  const contemplacoesQuery = useQuery({
    queryKey: ['contemplacoes-assembleia', assembleiaId],
    queryFn: () => api.contemplacoes.listarPorAssembleia(assembleiaId),
    enabled: !!assembleiaId,
  });

  const registrarMutation = useMutation({
    mutationFn: (dto) => api.contemplacoes.registrar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contemplacoes-assembleia', assembleiaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
    },
  });

  return {
    contemplacoes: contemplacoesQuery.data?.content || [],
    isLoading: contemplacoesQuery.isLoading,
    isError: contemplacoesQuery.isError,
    error: contemplacoesQuery.error,
    registrar: registrarMutation.mutateAsync,
    isRegistrando: registrarMutation.isPending,
  };
}
