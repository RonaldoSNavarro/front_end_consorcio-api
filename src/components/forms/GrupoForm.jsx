import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Loader2 } from 'lucide-react';

// Schema estrito de Regras de Negócio de Grupos
const grupoSchema = z.object({
  codigo: z.string().min(3, "Código BCB deve ter pelo menos 3 caracteres"),
  valorCredito: z.coerce.number().min(1000, "O crédito mínimo para formar um grupo é R$ 1.000,00"),
  prazoMeses: z.coerce.number().min(12, "O prazo mínimo permitido é de 12 meses").max(240, "Prazo máximo estourado (240 meses)"),
  taxaAdministracao: z.coerce.number().min(1, "A taxa de administração mínima permitida é 1%"),
  categoriaBem: z.enum(['IMOVEL', 'VEICULO_AUTOMOTOR', 'SERVICO', 'OUTROS_BENS_MOVEIS'], {
    errorMap: () => ({ message: "Categoria do Bem é obrigatória" })
  })
});

export const GrupoForm = ({ onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      valorCredito: 80000,
      prazoMeses: 60,
      taxaAdministracao: 15,
      categoriaBem: 'VEICULO_AUTOMOTOR'
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => api.grupos.salvar(data),
    onSuccess: () => {
      triggerToast("Grupo em Formação constituído com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
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
              Novo Grupo Financeiro
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Constituição Segura de Grupo (Zod Validation)
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="grupo-codigo">Código do Grupo (BACEN) *</label>
            <input id="grupo-codigo" type="text" {...register('codigo')} placeholder="Ex: GRUPO-A12" aria-required="true" aria-invalid={!!errors.codigo} />
            {errors.codigo && <span className="error-text" role="alert">{errors.codigo.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="grupo-credito">Carta de Crédito Base (R$) *</label>
            <input id="grupo-credito" type="number" step="0.01" {...register('valorCredito')} aria-required="true" aria-invalid={!!errors.valorCredito} />
            {errors.valorCredito && <span className="error-text" role="alert">{errors.valorCredito.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="grupo-categoria">Categoria do Bem (BCB) *</label>
            <select id="grupo-categoria" {...register('categoriaBem')} aria-required="true" aria-invalid={!!errors.categoriaBem}>
              <option value="VEICULO_AUTOMOTOR">Veículos Automotores</option>
              <option value="IMOVEL">Bens Imóveis</option>
              <option value="OUTROS_BENS_MOVEIS">Eletroeletrônicos e Outros Bens Móveis</option>
              <option value="SERVICO">Serviços</option>
            </select>
            {errors.categoriaBem && <span className="error-text" role="alert">{errors.categoriaBem.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="grupo-prazo">Prazo de Duração (Meses) *</label>
              <input id="grupo-prazo" type="number" {...register('prazoMeses')} aria-required="true" aria-invalid={!!errors.prazoMeses} />
              {errors.prazoMeses && <span className="error-text" role="alert">{errors.prazoMeses.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="grupo-taxa">Taxa de Administração (%) *</label>
              <input id="grupo-taxa" type="number" step="0.01" {...register('taxaAdministracao')} aria-required="true" aria-invalid={!!errors.taxaAdministracao} />
              {errors.taxaAdministracao && <span className="error-text" role="alert">{errors.taxaAdministracao.message}</span>}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Constituindo...' : 'Constituir Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
