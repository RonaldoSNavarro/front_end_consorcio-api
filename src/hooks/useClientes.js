import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Gestão de Clientes (REQ-CLI-001, REQ-CLI-002, REQ-CLI-003)
 */
export function useClientes(page = 0, size = 100) {
  const queryClient = useQueryClient();

  const clientesQuery = useQuery({
    queryKey: ['clientes', page, size],
    queryFn: () => api.clientes.listar(page, size),
    placeholderData: (previousData) => previousData,
  });

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.clientes.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }) => api.clientes.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const inativarMutation = useMutation({
    mutationFn: (id) => api.clientes.inativar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  // Função utilitária para busca de CEP via proxy
  const buscarCep = async (cep) => {
    return api.clientes.buscarCep(cep);
  };

  return {
    clientes: clientesQuery.data?.content || [],
    isLoading: clientesQuery.isLoading,
    isError: clientesQuery.isError,
    error: clientesQuery.error,
    refetch: clientesQuery.refetch,
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
    atualizar: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    inativar: inativarMutation.mutateAsync,
    isInativando: inativarMutation.isPending,
    buscarCep,
  };
}

/**
 * Hook para obter histórico de auditoria do cliente (REQ-AUD-001)
 */
export function useClienteHistorico(clienteId, tipo = null) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'historico', tipo],
    queryFn: () => api.clientes.obterHistorico(clienteId, tipo),
    enabled: !!clienteId,
  });
}
