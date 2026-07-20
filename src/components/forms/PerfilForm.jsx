import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePerfis } from '../../hooks/usePerfis';
import { X, Loader2 } from 'lucide-react';

const perfilSchema = z.object({
  nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
});

export const PerfilForm = ({ onClose, editId = null }) => {
  const { perfis, salvar, atualizar, isSaving } = usePerfis();
  const [selectedPermissoes, setSelectedPermissoes] = useState([]);
  
  const perfil = editId ? perfis.find(p => p.id === editId) : null;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: ''
    }
  });

  useEffect(() => {
    if (perfil) {
      reset({ nome: perfil.nome });
      setSelectedPermissoes(perfil.permissoes || []);
    }
  }, [perfil, reset]);

  const allPermissoes = [
    'VIEW_DASHBOARD',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_COTAS',
    'MANAGE_COTAS',
    'VIEW_GRUPOS',
    'MANAGE_GRUPOS',
    'VIEW_FINANCEIRO',
    'MANAGE_FINANCEIRO',
    'VIEW_COMPLIANCE',
    'MANAGE_COMPLIANCE',
    'VIEW_MEUS_DADOS',
    'VIEW_CLIENTES',
    'MANAGE_CLIENTES',
    'VIEW_RELATORIOS',
    'MANAGE_VENDAS'
  ];

  const handleTogglePermissao = (perm) => {
    setSelectedPermissoes(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  const onSubmit = (data) => {
    const dto = { ...data, permissoes: selectedPermissoes };
    if (editId) {
      atualizar({ id: editId, dto }, { onSuccess: () => onClose() });
    } else {
      salvar(dto, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {editId ? 'Editar Perfil' : 'Novo Perfil'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="form-group">
            <label className="form-label">Nome do Perfil</label>
            <input 
              type="text" 
              className={`form-input ${errors.nome ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              {...register('nome')} 
              placeholder="Ex: Gerente Financeiro"
            />
            {errors.nome && <span className="text-xs text-rose-500 mt-1">{errors.nome.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label mb-2">Permissões (Autorizações)</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              {allPermissoes.map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={selectedPermissoes.includes(perm)}
                    onChange={() => handleTogglePermissao(perm)}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {perm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
