import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Search, Loader2 } from 'lucide-react';

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

const FormField = ({ label, id, error, children, className = '' }) => (
  <div className={`form-group ${className}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    {error && (
      <span id={`error-${id}`} className="error-text" role="alert">
        {error.message}
      </span>
    )}
  </div>
);

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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="w-full max-w-2xl mx-4 p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">
              {editClienteId ? 'Editar' : 'Novo'} Cliente Consorciado
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Validação Estrita por Zod (Compliance BACEN)
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* DADOS PESSOAIS */}
            <FormField label="Nome / Razão Social *" id="cliente-nome" error={errors.nome} className="md:col-span-2">
              <input 
                id="cliente-nome" type="text" {...register('nome')} 
                placeholder="Nome completo"
                aria-required="true"
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? 'error-cliente-nome' : undefined}
              />
            </FormField>
            
            <FormField label="CPF / CNPJ (Números) *" id="cliente-cpf" error={errors.cpfCnpj}>
              <input 
                id="cliente-cpf" type="text" {...register('cpfCnpj')} 
                placeholder="Ex: 12345678901"
                aria-required="true"
                aria-invalid={!!errors.cpfCnpj}
              />
            </FormField>
            
            <FormField label="Nível de Risco (Compliance)" id="cliente-risco" error={null}>
              <select id="cliente-risco" {...register('nivelRisco')}>
                <option value="BAIXO">BAIXO - Perfil Conservador</option>
                <option value="MEDIO">MÉDIO - Perfil Moderado</option>
                <option value="ALTO">ALTO - Necessita Aprovação</option>
              </select>
            </FormField>
            
            <FormField label="E-mail" id="cliente-email" error={errors.email}>
              <input id="cliente-email" type="email" {...register('email')} placeholder="Ex: nome@empresa.com" />
            </FormField>
            
            <FormField label="Telefone" id="cliente-telefone" error={errors.telefone}>
              <input id="cliente-telefone" type="text" {...register('telefone')} placeholder="Ex: 11999999999" />
            </FormField>

            <FormField label="Patrimônio Declarado (R$)" id="cliente-patrimonio" error={errors.patrimonio}>
              <input id="cliente-patrimonio" type="number" step="0.01" {...register('patrimonio')} />
            </FormField>
            
            <FormField label="Renda Mensal (R$)" id="cliente-renda" error={errors.rendaMensal}>
              <input id="cliente-renda" type="number" step="0.01" {...register('rendaMensal')} />
            </FormField>

            {/* ENDEREÇO */}
            <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-4 mt-2">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Endereço</h4>
            </div>

            <FormField label="CEP (Apenas números)" id="cliente-cep" error={errors.cep}>
              <div className="flex gap-2">
                <input id="cliente-cep" type="text" {...register('cep')} placeholder="Ex: 01001000" />
                <button type="button" className="btn btn-outline btn-sm shrink-0" onClick={handleCepSearch}>
                  <Search className="w-3.5 h-3.5" />
                  Buscar
                </button>
              </div>
            </FormField>
            
            <FormField label="Localidade / UF" id="cliente-localidade" error={null}>
              <div className="flex gap-2">
                <input id="cliente-localidade" type="text" {...register('localidade')} placeholder="Cidade" className="flex-[3]" />
                <input id="cliente-uf" aria-label="UF" type="text" {...register('uf')} placeholder="UF" maxLength={2} className="flex-1 uppercase" />
              </div>
            </FormField>

            <FormField label="Logradouro" id="cliente-logradouro" error={null} className="md:col-span-2">
              <div className="flex gap-2">
                <input id="cliente-logradouro" type="text" {...register('logradouro')} placeholder="Rua/Avenida" className="flex-[3]" />
                <input id="cliente-numero" aria-label="Número" type="text" {...register('numero')} placeholder="Nº" className="flex-1" />
              </div>
            </FormField>

            <FormField label="Complemento" id="cliente-complemento" error={null}>
              <input id="cliente-complemento" type="text" {...register('complemento')} />
            </FormField>

            <FormField label="Bairro" id="cliente-bairro" error={null}>
              <input id="cliente-bairro" type="text" {...register('bairro')} />
            </FormField>

          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Validando & Salvando...' : 'Salvar Consorciado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
