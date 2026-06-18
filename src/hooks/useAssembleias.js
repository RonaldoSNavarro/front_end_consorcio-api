import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Gestão de Assembleias (REQ-ASM-001, REQ-ASM-002)
 */
export function useAssembleias(grupoId) {
  const queryClient = useQueryClient();

  const assembleiasQuery = useQuery({
    queryKey: ['assembleias', grupoId],
    queryFn: () => api.assembleias.listarPorGrupo(grupoId),
    enabled: !!grupoId,
  });

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.assembleias.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] }); // O grupo pode atualizar status após assembleia
    },
  });

  return {
    assembleias: assembleiasQuery.data?.content || [],
    isMock: assembleiasQuery.data?.isMock || false,
    isLoading: assembleiasQuery.isLoading,
    isError: assembleiasQuery.isError,
    error: assembleiasQuery.error,
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
  };
}
