import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Schema estrito de Regras de Negócio de Grupos
const grupoSchema = z.object({
  codigo: z.string().min(3, "Código BCB deve ter pelo menos 3 caracteres"),
  valorCredito: z.coerce.number().min(1000, "O crédito mínimo para formar um grupo é R$ 1.000,00"),
  prazoMeses: z.coerce.number().min(12, "O prazo mínimo permitido é de 12 meses").max(240, "Prazo máximo estourado (240 meses)"),
  taxaAdministracao: z.coerce.number().min(1, "A taxa de administração mínima permitida é 1%"),
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
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
        <h3>Novo Grupo Financeiro</h3>
        <p style={{ marginBottom: '20px', color: '#9ca3af' }}>Constituição Segura de Grupo (Zod Validation)</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="codigo">Código do Grupo (BACEN) *</label>
              <input id="codigo" type="text" {...register('codigo')} placeholder="Ex: GRUPO-A12" />
              {errors.codigo && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.codigo.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="valorCredito">Carta de Crédito Base (R$) *</label>
              <input id="valorCredito" type="number" step="0.01" {...register('valorCredito')} />
              {errors.valorCredito && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.valorCredito.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prazoMeses">Prazo de Duração (Meses) *</label>
              <input id="prazoMeses" type="number" {...register('prazoMeses')} />
              {errors.prazoMeses && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.prazoMeses.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="taxaAdministracao">Taxa de Administração (%) *</label>
              <input id="taxaAdministracao" type="number" step="0.01" {...register('taxaAdministracao')} />
              {errors.taxaAdministracao && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.taxaAdministracao.message}</span>}
            </div>
          </div>
          
          <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Constituindo...' : 'Constituir Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
