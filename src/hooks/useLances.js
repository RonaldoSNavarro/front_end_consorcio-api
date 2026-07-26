import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/**
 * Hook Customizado — Oferta de Lances (REQ-LAN-001, REQ-LAN-002, REQ-LAN-004).
 * A amortização ocorre exclusivamente na liquidação identificada do lance vencedor.
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

  return {
    salvar: salvarMutation.mutateAsync,
    isSalvando: salvarMutation.isPending,
  };
}
