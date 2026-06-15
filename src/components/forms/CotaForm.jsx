import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
        <h3>Emitir Nova Cota Consorcial</h3>
        <p style={{ marginBottom: '20px', color: '#9ca3af' }}>Vínculo oficial de cliente a um grupo constituído</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numeroCota">Número Sequencial da Cota *</label>
              <input id="numeroCota" type="number" {...register('numeroCota')} />
              {errors.numeroCota && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.numeroCota.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="clienteId">Cliente Consorciado (Inativos Ocultados) *</label>
              <select id="clienteId" {...register('clienteId')}>
                <option value="">Selecione um cliente...</option>
                {Array.isArray(clientes) && clientes.filter(c => c.statusCliente !== 'INATIVO').map(c => (
                  <option key={c.id} value={c.id}>{c.nome} (CPF/CNPJ: {c.cpfCnpj})</option>
                ))}
              </select>
              {errors.clienteId && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.clienteId.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="grupoId">Grupo de Investimento (BACEN) *</label>
              <select id="grupoId" {...register('grupoId')}>
                <option value="">Selecione um grupo ativo...</option>
                {Array.isArray(grupos) && grupos.filter(g => g.status !== 'ENCERRADO').map(g => (
                  <option key={g.id} value={g.id}>{g.codigo} - Crédito Base: R$ {g.valorCredito?.toLocaleString('pt-BR')}</option>
                ))}
              </select>
              {errors.grupoId && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.grupoId.message}</span>}
            </div>
          </div>
          
          <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Emitindo Cota...' : 'Emitir Título de Cota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
