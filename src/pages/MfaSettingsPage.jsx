import React, { useState } from 'react';
import { api } from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Mail, AlertCircle, ShieldAlert, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const MfaSettingsPage = () => {
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const { triggerToast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: () => api.setupMfa(),
    onSuccess: () => {
      triggerToast('Código de ativação enviado por e-mail!', 'success');
      setCodeSent(true);
    },
    onError: (err) => {
      triggerToast(err.message || 'Erro ao enviar código de e-mail.', 'danger');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (code) => api.confirmMfa(code),
    onSuccess: async () => {
      triggerToast('Autenticação em Duas Etapas por E-mail ativada!', 'success');
      setCode('');
      setCodeSent(false);
      // Invalida a sessão para atualizar user.mfaEnabled
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (err) => {
      triggerToast(err.message || 'Código inválido. Tente novamente.', 'danger');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.resetMfa(),
    onSuccess: async () => {
      triggerToast('Autenticação em Duas Etapas desativada.', 'success');
      setCodeSent(false);
      setCode('');
      // Invalida a sessão para atualizar user.mfaEnabled
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (err) => {
      triggerToast(err.message || 'Erro ao desativar MFA.', 'danger');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      confirmMutation.mutate(code);
    }
  };

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja desativar a Autenticação em Duas Etapas? Isso reduzirá a segurança da sua conta.")) {
      resetMutation.mutate();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">Autenticação em Duas Etapas (MFA)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>
      </div>

      {user?.mfaEnabled ? (
        // Estado: MFA Ativado
        <div className="glass-panel p-8 rounded-2xl max-w-lg mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seu MFA está Ativo por E-mail</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Sua conta está protegida com autenticação multifator. Ao fazer login, um código de verificação temporário será enviado para o e-mail cadastrado:
            </p>
            <div className="mt-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block text-slate-700 dark:text-slate-300 font-mono text-sm font-semibold">
              {user.email || 'Não cadastrado'}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg mb-4">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Desativar o MFA tornará a sua conta menos segura.</span>
            </div>
            
            <button
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="btn btn-danger py-3 px-6 text-sm"
            >
              {resetMutation.isPending ? 'Desativando...' : 'Desativar e Resetar MFA'}
            </button>
          </div>
        </div>
      ) : (
        // Estado: Configurando MFA por E-mail
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">MFA via Código por E-mail</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              O código MFA será enviado para o e-mail cadastrado em seu usuário.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl w-full border border-slate-200 dark:border-slate-700/50 text-left space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">E-mail Cadastrado</span>
              <div className="text-slate-800 dark:text-slate-200 font-semibold font-mono break-all text-sm">
                {user?.email || 'Nenhum e-mail registrado. Cadastre um e-mail antes de ativar.'}
              </div>
            </div>

            {!codeSent ? (
              <button 
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending || !user?.email}
                className="btn btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2"
              >
                {setupMutation.isPending ? 'Enviando Código...' : 'Enviar Código por E-mail'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full mt-6 space-y-2">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center bg-emerald-50 dark:bg-emerald-500/10 py-2 rounded-lg">
                  <span>E-mail enviado! Verifique seu console ou caixa de entrada.</span>
                </div>
                <button 
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.isPending}
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium block mx-auto py-1"
                >
                  Reenviar Código de Confirmação
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Confirmar Ativação</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Digite o código de 6 dígitos enviado para seu e-mail para validar e ativar o MFA nesta conta.
            </p>

            <form onSubmit={handleSubmit} className="mt-auto space-y-4">
              <div className="form-group">
                <label>Código de Ativação</label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[1em] font-mono text-2xl py-4"
                  placeholder="000000"
                  disabled={!codeSent}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-block py-3"
                disabled={code.length !== 6 || confirmMutation.isPending || !codeSent}
              >
                {confirmMutation.isPending ? 'Verificando...' : 'Ativar MFA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
