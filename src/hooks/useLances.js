import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Oferta de Lances (REQ-LAN-001, REQ-LAN-002, REQ-LAN-003, REQ-LAN-004)
 */
export function useLances() {
  const queryClient = useQueryClient();

  const salvarMutation = useMutation({
    mutationFn: (dto) => api.lances.salvar(dto),
    onSuccess: () => {
      // Invalida dados de assembleias e cotas, que podem ter lances associados
      queryClient.invalidateQueries({ queryKey: ['assembleias'] });
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
    },
  });

  const amortizarPrazoMutation = useMutation({
    mutationFn: ({ cotaId, valorLance }) => api.parcelas.amortizarPorReducaoDePrazo(cotaId, valorLance),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', variables.cotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia', variables.cotaId] });
    },
  });

  const amortizarDiluicaoMutation = useMutation({
    mutationFn: ({ cotaId, valorLance }) => api.parcelas.amortizarPorDiluicao(cotaId, valorLance),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parcelas', variables.cotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia', variables.cotaId] });
    },
  });

  return {
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
    amortizarPrazo: amortizarPrazoMutation.mutateAsync,
    isAmortizandoPrazo: amortizarPrazoMutation.isPending,
    amortizarDiluicao: amortizarDiluicaoMutation.mutateAsync,
    isAmortizandoDiluicao: amortizarDiluicaoMutation.isPending,
  };
}
