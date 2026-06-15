import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, detectBackend } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isMockMode, setIsMockMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa detecção de backend apenas uma vez e busca sessão ativa
  useEffect(() => {
    const initBackend = async () => {
      const mockDetected = await detectBackend();
      setIsMockMode(mockDetected);
      api.setMockMode(mockDetected);
      
      if (!mockDetected) {
        // Modo Real: Tenta recuperar a sessão ativa no backend pelo Cookie JWT
        try {
          const userData = await api.obterUsuarioLogado();
          setToken("cookie_managed");
          setUser(userData);
        } catch (e) {
          setToken(null);
          setUser(null);
        }
      } else {
        // Modo Simulado: Tenta ler o token do localStorage
        try {
          const t = localStorage.getItem('consorcio_api_token');
          if (t && t !== 'undefined' && t !== 'null') {
            setToken(t);
            try {
              const savedUser = localStorage.getItem('consorcio_api_user');
              if (savedUser) {
                setUser(JSON.parse(savedUser));
              } else {
                setUser({ login: "admin", role: "ADMIN", nome: "Ronaldo Navarro", email: "ronaldo@dev.com", isMock: true });
              }
            } catch (e) {
              setUser({ login: "admin", role: "ADMIN", nome: "Ronaldo Navarro", email: "ronaldo@dev.com", isMock: true });
            }
          } else {
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initBackend();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setToken(res.token);
    
    if (api.getIsMockMode()) {
      try {
        localStorage.setItem('consorcio_api_token', res.token);
        const userData = { login: username, role: username === 'admin' ? 'ADMIN' : 'OPERADOR', nome: "Ronaldo Navarro", email: "ronaldo@dev.com", isMock: true };
        setUser(userData);
        localStorage.setItem('consorcio_api_user', JSON.stringify(userData));
      } catch (e) {
        console.warn("Storage write blocked:", e);
      }
    } else {
      try {
        const userData = await api.obterUsuarioLogado();
        setUser(userData);
      } catch (e) {
        console.error("Erro ao obter dados do usuário após login real:", e);
        setUser({ login: username, role: "ADMIN", nome: username });
      }
    }
    return res;
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('consorcio_api_token');
      localStorage.removeItem('consorcio_api_user');
    } catch (e) {
      console.warn("Storage write blocked:", e);
    }
  };

  const toggleMockMode = () => {
    const newMock = !isMockMode;
    setIsMockMode(newMock);
    api.setMockMode(newMock);
    
    // Reseta token/user ao mudar de modo para evitar vazamento de estado
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('consorcio_api_token');
      localStorage.removeItem('consorcio_api_user');
    } catch (e) {}
    
    return newMock;
  };

  return (
    <AuthContext.Provider value={{ token, user, isMockMode, isLoading, login, logout, toggleMockMode }}>
      {children}
    </AuthContext.Provider>
  );
};
