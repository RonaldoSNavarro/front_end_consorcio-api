import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LockIcon, InfoIcon, LogoIcon } from '../components/ui/Icons';
import { useNavigate, Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const { login, isMockMode, token } = useAuth();
  const { triggerToast } = useToast();
  const navigate = useNavigate();

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
    <div className="login-screen animate-fade-in">
      <div className="glow-vector-1"></div>
      <div className="glow-vector-2"></div>
      <div className="glass-panel login-card">
        <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ transform: 'scale(1.5)', color: 'var(--primary)', marginBottom: '10px' }}>
            <LogoIcon />
          </div>
          <h2>Consórcio Admin</h2>
          <p>Gerenciamento Financeiro & Contemplações</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Login Administrativo</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>

          <div className="info-preset">
            <InfoIcon />
            <span>Dica: Use <strong>admin</strong> / <strong>admin</strong> para entrar direto</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <LockIcon /> Autenticar
          </button>
        </form>

        <div className="connection-info">
          <span className={`status-dot ${isMockMode ? 'mock' : 'real'}`}></span>
          <span>{isMockMode ? 'Simulação Local Ativa' : 'API Spring Boot Conectada'}</span>
        </div>
      </div>
    </div>
  );
};
