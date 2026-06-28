import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const usePldFtQuery = (dataInicio, dataFim, options = {}) => {
  const { token } = useAuth();
  
  // Formata datas YYYY-MM-DD para YYYY-MM-DDThh:mm:ss esperado pelo LocalDateTime do Spring Boot
  const dataInicioFormatted = dataInicio && !dataInicio.includes('T') ? `${dataInicio}T00:00:00` : dataInicio;
  const dataFimFormatted = dataFim && !dataFim.includes('T') ? `${dataFim}T23:59:59` : dataFim;
  
  return useQuery({
    queryKey: ['relatorios', 'pld-ft', dataInicioFormatted, dataFimFormatted],
    queryFn: () => api.relatorios.pldFt(dataInicioFormatted, dataFimFormatted),
    enabled: !!token && !!dataInicio && !!dataFim && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 min
    ...options
  });
};

export const useBalanceteQuery = (grupoId, dataReferencia, options = {}) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['relatorios', 'balancete', grupoId, dataReferencia],
    queryFn: () => api.relatorios.balancete(grupoId, dataReferencia),
    enabled: !!token && !!grupoId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

export const useEstatisticasQuery = (grupoId, dataInicio, dataFim, options = {}) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['relatorios', 'estatisticas', grupoId, dataInicio, dataFim],
    queryFn: () => api.relatorios.estatisticas(grupoId, dataInicio, dataFim),
    enabled: !!token && !!grupoId && !!dataInicio && !!dataFim && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};
