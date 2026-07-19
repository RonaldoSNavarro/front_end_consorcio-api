import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const useUsuarios = () => {
  const queryClient = useQueryClient();
  const { triggerToast } = useToast();

  const query = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.usuarios.listar(),
  });

  const salvar = useMutation({
    mutationFn: (dto) => api.usuarios.salvar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      triggerToast('success', 'Usuário salvo com sucesso! É necessário sair e entrar novamente para aplicar as alterações.');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  const atualizar = useMutation({
    mutationFn: ({ id, dto }) => api.usuarios.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      triggerToast('success', 'Usuário atualizado com sucesso! É necessário sair e entrar novamente para aplicar as alterações.');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  const excluir = useMutation({
    mutationFn: (id) => api.usuarios.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      triggerToast('success', 'Usuário excluído com sucesso');
    },
    onError: (err) => {
      triggerToast('error', err.message);
    }
  });

  return {
    usuarios: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    salvar: salvar.mutate,
    atualizar: atualizar.mutate,
    excluir: excluir.mutate,
    isSaving: salvar.isPending || atualizar.isPending
  };
};
