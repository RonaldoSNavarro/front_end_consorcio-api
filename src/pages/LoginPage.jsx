import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Info, Building2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'O login é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
});

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, token, mfaPrompt, verifyMfa, cancelMfa } = useAuth();
  const { triggerToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setFocus: setLoginFocus,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'admin',
    }
  });

  const {
    register: registerMfa,
    handleSubmit: handleMfaSubmit,
    setFocus: setMfaFocus,
    reset: resetMfa,
    formState: { errors: mfaErrors, isSubmitting: isMfaSubmitting }
  } = useForm({
    resolver: zodResolver(mfaSchema),
  });


  useEffect(() => {
    if (mfaPrompt) {
      setMfaFocus('code');
    } else {
      setLoginFocus('username');
    }
  }, [mfaPrompt, setLoginFocus, setMfaFocus]);

  // Se já estiver logado, foge dessa página
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password);
      // Not triggered toast on success here, because it might be MFA
    } catch (err) {
      triggerToast(err.message, "danger");
    }
  };

  const onMfaSubmit = async (data) => {
    try {
      await verifyMfa(data.code);
      triggerToast("Login efetuado com sucesso!", "success");
      navigate('/dashboard');
    } catch (err) {
      triggerToast(err.message, "danger");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Ambient glows */}
      <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] bg-gradient-radial from-brand-500/[0.06] to-transparent blur-[120px] pointer-events-none dark:from-brand-500/[0.04]" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] bg-gradient-radial from-blue-500/[0.05] to-transparent blur-[120px] pointer-events-none dark:from-blue-500/[0.03]" />
      
      <div className="w-full max-w-[400px] mx-4 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/25 mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Consórcio Admin
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Gerenciamento de Consórcios
            </p>
          </div>
          
          {!mfaPrompt ? (
            <form onSubmit={handleLoginSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <label htmlFor="login-username">Login Administrativo</label>
                <input 
                  id="login-username"
                  type="text" 
                  {...registerLogin('username')}
                  autoComplete="username"
                  className={loginErrors.username ? 'border-red-500' : ''}
                />
                {loginErrors.username && <span className="text-red-500 text-xs mt-1 block">{loginErrors.username.message}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    id="login-password"
                    type={showPassword ? 'text' : 'password'} 
                    {...registerLogin('password')}
                    autoComplete="current-password"
                    className={`pr-10 ${loginErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && <span className="text-red-500 text-xs mt-1 block">{loginErrors.password.message}</span>}
              </div>

              <button type="submit" disabled={isLoginSubmitting} className="btn btn-primary btn-block py-3 text-sm">
                <Lock className="w-4 h-4" /> {isLoginSubmitting ? 'Autenticando...' : 'Autenticar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit(onMfaSubmit)} className="space-y-4 animate-fade-in">
              <div className="bg-brand-50 dark:bg-brand-500/10 p-4 rounded-xl mb-4 border border-brand-100 dark:border-brand-500/20">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">Verificação em Duas Etapas</h3>
                    <p className="text-xs text-brand-700 dark:text-brand-300 mt-1">
                      Enviamos um código de verificação de 6 dígitos para o seu e-mail cadastrado. Por favor, digite-o abaixo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mfa-code">Código (6 dígitos)</label>
                <input 
                  id="mfa-code"
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  {...registerMfa('code')}
                  autoComplete="one-time-code"
                  className={`text-center tracking-[0.5em] font-mono text-xl py-3 ${mfaErrors.code ? 'border-red-500' : ''}`}
                  placeholder="000000"
                />
                {mfaErrors.code && <span className="text-red-500 text-xs mt-1 block">{mfaErrors.code.message}</span>}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { cancelMfa(); resetMfa(); }} disabled={isMfaSubmitting} className="btn btn-ghost flex-1 py-3 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={isMfaSubmitting} className="btn btn-primary flex-1 py-3 text-sm">
                  {isMfaSubmitting ? 'Verificando...' : 'Verificar Código'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
