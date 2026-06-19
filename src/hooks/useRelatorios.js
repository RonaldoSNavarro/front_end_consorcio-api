import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthSource } from './useAuth';

export const usePldFtQuery = (dataInicio, dataFim, options = {}) => {
  const { auth } = useAuthSource();
  
  return useQuery({
    queryKey: ['relatorios', 'pld-ft', dataInicio, dataFim],
    queryFn: () => api.relatorios.pldFt(dataInicio, dataFim),
    enabled: !!auth.token && !!dataInicio && !!dataFim && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 min
    ...options
  });
};

export const useBalanceteQuery = (grupoId, dataReferencia, options = {}) => {
  const { auth } = useAuthSource();
  
  return useQuery({
    queryKey: ['relatorios', 'balancete', grupoId, dataReferencia],
    queryFn: () => api.relatorios.balancete(grupoId, dataReferencia),
    enabled: !!auth.token && !!grupoId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

export const useEstatisticasQuery = (grupoId, dataInicio, dataFim, options = {}) => {
  const { auth } = useAuthSource();
  
  return useQuery({
    queryKey: ['relatorios', 'estatisticas', grupoId, dataInicio, dataFim],
    queryFn: () => api.relatorios.estatisticas(grupoId, dataInicio, dataFim),
    enabled: !!auth.token && !!grupoId && !!dataInicio && !!dataFim && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};
