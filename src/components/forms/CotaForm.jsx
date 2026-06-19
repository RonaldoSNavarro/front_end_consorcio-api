import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Loader2 } from 'lucide-react';

// Schema Zod para Cota: Impede números negativos e seleções inválidas
const cotaSchema = z.object({
  numeroCota: z.coerce.number().min(1, "O número da cota deve ser maior que zero (0)"),
  clienteId: z.coerce.number().min(1, "Selecione um cliente cadastrado e ativo"),
  grupoId: z.coerce.number().min(1, "Selecione o Grupo Financeiro BACEN"),
});

export const CotaForm = ({ onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  // O React Query já vai pegar as listas em CACHE, sem precisar bater na API de novo!
  const { data: clientesData } = useQuery({ queryKey: ['clientes'], queryFn: () => api.clientes.listar(0, 100) });
  const { data: gruposData } = useQuery({ queryKey: ['grupos'], queryFn: () => api.grupos.listar() });

  const clientes = clientesData?.content || clientesData || [];
  const grupos = gruposData?.content || gruposData || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(cotaSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.cotas.salvar(data),
    onSuccess: () => {
      triggerToast("Cota emitida e título registrado com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">
              Emitir Nova Cota Consorcial
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Vínculo oficial de cliente a um grupo constituído
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="cota-numero">Número Sequencial da Cota *</label>
            <input id="cota-numero" type="number" {...register('numeroCota')} aria-required="true" aria-invalid={!!errors.numeroCota} />
            {errors.numeroCota && <span className="error-text" role="alert">{errors.numeroCota.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cota-cliente">Cliente Consorciado (Inativos Ocultados) *</label>
            <select id="cota-cliente" {...register('clienteId')} aria-required="true" aria-invalid={!!errors.clienteId}>
              <option value="">Selecione um cliente...</option>
              {Array.isArray(clientes) && clientes.filter(c => c.statusCliente !== 'INATIVO').map(c => (
                <option key={c.id} value={c.id}>{c.nome} (CPF/CNPJ: {c.cpfCnpj})</option>
              ))}
            </select>
            {errors.clienteId && <span className="error-text" role="alert">{errors.clienteId.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cota-grupo">Grupo de Investimento (BACEN) *</label>
            <select id="cota-grupo" {...register('grupoId')} aria-required="true" aria-invalid={!!errors.grupoId}>
              <option value="">Selecione um grupo ativo...</option>
              {Array.isArray(grupos) && grupos.filter(g => g.status !== 'ENCERRADO').map(g => (
                <option key={g.id} value={g.id}>{g.codigo} - Crédito Base: R$ {g.valorCredito?.toLocaleString('pt-BR')}</option>
              ))}
            </select>
            {errors.grupoId && <span className="error-text" role="alert">{errors.grupoId.message}</span>}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Emitindo Cota...' : 'Emitir Título de Cota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
