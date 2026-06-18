import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Gestão de Parcelas (REQ-FUN-001, REQ-FUN-002, REQ-INA-001, REQ-INA-002, REQ-INA-003, REQ-SEG-001)
 */
export function useParcelas(cotaId) {
  const queryClient = useQueryClient();

  const parcelasQuery = useQuery({
    queryKey: ['parcelas', cotaId],
    queryFn: () => api.parcelas.listarPorCota(cotaId),
    enabled: !!cotaId,
  });

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.parcelas.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', cotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia', cotaId] });
    },
  });

  const pagarMutation = useMutation({
    mutationFn: ({ id, dataPagamento }) => api.parcelas.pagar(id, dataPagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', cotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia', cotaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] }); // Balanço do grupo
    },
  });

  const estornarMutation = useMutation({
    mutationFn: (id) => api.parcelas.estornar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', cotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia', cotaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
  });

  const amortizarPrazoMutation = useMutation({
    mutationFn: ({ valorLance }) => api.parcelas.amortizarPorReducaoDePrazo(cotaId, valorLance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', cotaId] });
    },
  });

  const amortizarDiluicaoMutation = useMutation({
    mutationFn: ({ valorLance }) => api.parcelas.amortizarPorDiluicao(cotaId, valorLance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', cotaId] });
    },
  });

  return {
    parcelas: parcelasQuery.data?.content || [],
    isMock: parcelasQuery.data?.isMock || false,
    isLoading: parcelasQuery.isLoading,
    isError: parcelasQuery.isError,
    error: parcelasQuery.error,
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
    pagar: pagarMutation.mutateAsync,
    isPagando: pagarMutation.isPending,
    estornar: estornarMutation.mutateAsync,
    isEstornando: estornarMutation.isPending,
    amortizarPrazo: amortizarPrazoMutation.mutateAsync,
    isAmortizandoPrazo: amortizarPrazoMutation.isPending,
    amortizarDiluicao: amortizarDiluicaoMutation.mutateAsync,
    isAmortizandoDiluicao: amortizarDiluicaoMutation.isPending,
  };
}

/**
 * Hook para consulta de mora/encargos de inadimplência de uma cota
 */
export function useInadimplencia(cotaId) {
  return useQuery({
    queryKey: ['inadimplencia', cotaId],
    queryFn: () => api.parcelas.obterInadimplenciaCota(cotaId),
    enabled: !!cotaId,
  });
}
