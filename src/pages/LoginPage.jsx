import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Info, Building2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isMockMode, token } = useAuth();
  const { triggerToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Se já estiver logado, foge dessa página
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
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
              Gerenciamento Financeiro & Contemplações
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label htmlFor="login-username">Login Administrativo</label>
              <input 
                ref={usernameRef}
                id="login-username"
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">Senha de Acesso</label>
              <div className="relative">
                <input 
                  id="login-password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  autoComplete="current-password"
                  className="pr-10"
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
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/15 text-xs text-blue-600 dark:text-blue-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Dica: Use <strong>admin</strong> / <strong>admin</strong> para entrar direto</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block py-3 text-sm">
              <Lock className="w-4 h-4" /> Autenticar
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs font-medium text-slate-400">
            <span className={`status-dot ${isMockMode ? 'mock' : 'real'}`} />
            <span>{isMockMode ? 'Simulação Local Ativa' : 'API Spring Boot Conectada'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
