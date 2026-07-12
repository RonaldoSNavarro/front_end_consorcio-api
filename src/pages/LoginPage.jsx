import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Loader2, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login, token, isLoading } = useAuth();

  useEffect(() => {
    // Se não estiver logado nem carregando, inicia o fluxo OIDC
    if (!token && !isLoading) {
      login();
    }
  }, [token, isLoading, login]);

  // Se já tiver token, vai pro dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] bg-gradient-radial from-brand-500/[0.06] to-transparent blur-[120px] pointer-events-none dark:from-brand-500/[0.04]" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] bg-gradient-radial from-blue-500/[0.05] to-transparent blur-[120px] pointer-events-none dark:from-blue-500/[0.03]" />
      
      <div className="w-full max-w-[400px] mx-4 animate-fade-in text-center">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/25 mb-4 relative">
            <Building2 className="w-8 h-8 text-white" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Consórcio Admin
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Ambiente Seguro (SSO)
          </p>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Conectando ao provedor de identidade...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
