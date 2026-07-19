import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const usePerfis = () => {
  const queryClient = useQueryClient();
  const { triggerToast } = useToast();

  const query = useQuery({
    queryKey: ['perfis'],
    queryFn: () => api.perfis.listar(),
  });

  const salvar = useMutation({
    mutationFn: (dto) => api.perfis.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      triggerToast('success', 'Perfil salvo com sucesso! Deslogue e logue novamente para aplicar as alterações.');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  const atualizar = useMutation({
    mutationFn: ({ id, dto }) => api.perfis.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      triggerToast('success', 'Perfil atualizado com sucesso! Deslogue e logue novamente para aplicar as alterações.');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  const excluir = useMutation({
    mutationFn: (id) => api.perfis.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      triggerToast('success', 'Perfil excluído com sucesso');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  return {
    perfis: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    salvar: salvar.mutate,
    atualizar: atualizar.mutate,
    excluir: excluir.mutate,
    isSaving: salvar.isPending || atualizar.isPending
  };
};
