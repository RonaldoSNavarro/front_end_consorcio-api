import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Zod Schema for Cliente validation (Evita Lixo no Banco de Dados)
const clienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().regex(/^\d{11}$|^\d{14}$/, "CPF deve ter 11 dígitos ou CNPJ 14 dígitos (apenas números)"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  telefone: z.string().min(10, "Telefone inválido").optional().or(z.literal('')),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos numéricos").optional().or(z.literal('')),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().max(2, "UF deve ter no máximo 2 letras").optional().or(z.literal('')),
  patrimonio: z.coerce.number().min(0, "O patrimônio não pode ser negativo").default(0),
  rendaMensal: z.coerce.number().min(0, "A renda mensal não pode ser negativa").default(0),
  nivelRisco: z.enum(['BAIXO', 'MEDIO', 'ALTO']).default('MEDIO'),
});

export const ClienteForm = ({ onClose, editClienteId }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nivelRisco: 'MEDIO',
      patrimonio: 150000,
      rendaMensal: 5000,
    }
  });

  const watchCep = watch('cep');

  const handleCepSearch = async () => {
    if (!watchCep || watchCep.length !== 8) {
      triggerToast("O CEP deve conter exatamente 8 dígitos numéricos para a busca.", "warning");
      return;
    }
    try {
      triggerToast("Buscando endereço via ViaCEP...", "info");
      const address = await api.clientes.buscarCep(watchCep);
      setValue('logradouro', address.logradouro || '');
      setValue('bairro', address.bairro || '');
      setValue('localidade', address.localidade || '');
      setValue('uf', address.uf || '');
      triggerToast("Endereço preenchido com sucesso!", "success");
    } catch (err) {
      triggerToast("CEP não encontrado ou erro na busca.", "warning");
    }
  };

  const mutation = useMutation({
    mutationFn: (data) => editClienteId 
      ? api.clientes.atualizar(editClienteId, data) 
      : api.clientes.salvar(data),
    onSuccess: () => {
      triggerToast(`Cliente ${editClienteId ? 'atualizado' : 'cadastrado'} com sucesso!`, "success");
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel" style={{ maxWidth: '700px' }}>
        <h3>{editClienteId ? 'Editar' : 'Novo'} Cliente Consorciado</h3>
        <p style={{ marginBottom: '20px', color: '#9ca3af' }}>Validação Estrita por Zod (Compliance BACEN)</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            {/* DADOS PESSOAIS */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="nome">Nome / Razão Social *</label>
              <input id="nome" type="text" {...register('nome')} placeholder="Nome completo" />
              {errors.nome && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.nome.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="cpfCnpj">CPF / CNPJ (Números) *</label>
              <input id="cpfCnpj" type="text" {...register('cpfCnpj')} placeholder="Ex: 12345678901" />
              {errors.cpfCnpj && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.cpfCnpj.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="nivelRisco">Nível de Risco (Compliance)</label>
              <select id="nivelRisco" {...register('nivelRisco')}>
                <option value="BAIXO">BAIXO - Perfil Conservador</option>
                <option value="MEDIO">MÉDIO - Perfil Moderado</option>
                <option value="ALTO">ALTO - Necessita Aprovação</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" {...register('email')} placeholder="Ex: nome@empresa.com" />
              {errors.email && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.email.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" type="text" {...register('telefone')} placeholder="Ex: 11999999999" />
              {errors.telefone && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.telefone.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patrimonio">Patrimônio Declarado (R$)</label>
              <input id="patrimonio" type="number" step="0.01" {...register('patrimonio')} />
              {errors.patrimonio && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.patrimonio.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="rendaMensal">Renda Mensal (R$)</label>
              <input id="rendaMensal" type="number" step="0.01" {...register('rendaMensal')} />
              {errors.rendaMensal && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.rendaMensal.message}</span>}
            </div>

            {/* ENDEREÇO */}
            <hr style={{ gridColumn: 'span 2', borderColor: 'rgba(255,255,255,0.1)' }} />

            <div className="form-group">
              <label htmlFor="cep">CEP (Apenas números)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input id="cep" type="text" {...register('cep')} placeholder="Ex: 01001000" />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCepSearch}>
                  Buscar ViaCEP
                </button>
              </div>
              {errors.cep && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.cep.message}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="localidade">Localidade / UF</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input id="localidade" type="text" {...register('localidade')} placeholder="Cidade" style={{ flex: 3 }} />
                <input id="uf" aria-label="UF" type="text" {...register('uf')} placeholder="UF" maxLength={2} style={{ textTransform: 'uppercase', flex: 1 }} />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="logradouro">Logradouro Completo (Rua e Número)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input id="logradouro" type="text" {...register('logradouro')} placeholder="Rua/Avenida" style={{ flex: 3 }} />
                <input id="numero" aria-label="Número" type="text" {...register('numero')} placeholder="Número" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="complemento">Complemento</label>
              <input id="complemento" type="text" {...register('complemento')} />
            </div>

            <div className="form-group">
              <label htmlFor="bairro">Bairro</label>
              <input id="bairro" type="text" {...register('bairro')} />
            </div>

          </div>
          
          <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Validando & Salvando...' : 'Salvar Consorciado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
