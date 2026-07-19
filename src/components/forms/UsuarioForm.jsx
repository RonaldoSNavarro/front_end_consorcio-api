import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePerfis } from '../../hooks/usePerfis';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const usuarioSchema = z.object({
  login: z.string().email("Login deve ser um e-mail válido"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional().or(z.literal('')),
  perfilId: z.coerce.number().min(1, "Selecione um perfil")
}).superRefine((data, ctx) => {
  // Se for criação (sem id), a senha é obrigatória
  // Não temos como saber aqui se é edição facilmente, então validaremos no componente
});

export const UsuarioForm = ({ onClose, editId = null }) => {
  const { usuarios, salvar, atualizar, isSaving } = useUsuarios();
  const { perfis } = usePerfis();
  const [showPassword, setShowPassword] = useState(false);
  
  const usuario = editId ? usuarios.find(u => u.id === editId) : null;

  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      login: '',
      nome: '',
      senha: '',
      perfilId: ''
    }
  });

  useEffect(() => {
    if (usuario) {
      reset({ 
        login: usuario.username || usuario.email, 
        nome: usuario.nome || '',
        perfilId: usuario.perfil?.id || '' 
      });
    }
  }, [usuario, reset]);

  const onSubmit = (data) => {
    if (!editId && !data.senha) {
      setError('senha', { type: 'manual', message: 'Senha é obrigatória para novos usuários' });
      return;
    }

    const dto = { 
      username: data.login, 
      email: data.login,
      nome: data.nome,
      perfilId: data.perfilId 
    };
    if (data.senha) {
      dto.senha = data.senha;
    }

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
            {editId ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="form-group">
            <label className="form-label">E-mail (Login)</label>
            <input 
              type="email" 
              className={`form-input ${errors.login ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              {...register('login')} 
              placeholder="usuario@empresa.com"
              disabled={!!editId} // Login não pode ser alterado na edição segundo a regra (opcional)
            />
            {errors.login && <span className="text-xs text-rose-500 mt-1">{errors.login.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input 
              type="text" 
              className={`form-input ${errors.nome ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              {...register('nome')} 
              placeholder="Nome do usuário"
            />
            {errors.nome && <span className="text-xs text-rose-500 mt-1">{errors.nome.message}</span>}
          </div>

          <div className="form-group relative">
            <label className="form-label">{editId ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`form-input pr-10 ${errors.senha ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                {...register('senha')} 
                placeholder="******"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.senha && <span className="text-xs text-rose-500 mt-1">{errors.senha.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Perfil de Acesso</label>
            <select 
              className={`form-select ${errors.perfilId ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              {...register('perfilId')}
            >
              <option value="">Selecione um perfil...</option>
              {perfis?.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {errors.perfilId && <span className="text-xs text-rose-500 mt-1">{errors.perfilId.message}</span>}
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
