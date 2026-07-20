import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);
  
  // MFA state
  const [mfaPrompt, setMfaPrompt] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await api.obterUsuarioLogado();
        setToken('cookie_managed');
      } catch {
        setToken(null);
      }
      setIsDetecting(false);
    };
    init();
  }, []);

  const sessionQuery = useQuery({
    queryKey: ['session', token],
    queryFn: async () => {
      return api.obterUsuarioLogado();
    },
    enabled: !isDetecting && !!token,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      return api.login(username, password);
    },
    onSuccess: async (res) => {
      if (res.mfaRequired) {
        setTempToken(res.tempToken);
        setMfaPrompt(true);
      } else {
        setToken(res.token);
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    }
  });

  const verifyMfaMutation = useMutation({
    mutationFn: async ({ code }) => {
      return api.loginMfa(tempToken, code);
    },
    onSuccess: async (res) => {
      setMfaPrompt(false);
      setTempToken(null);
      setToken(res.token);
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.logout();
    },
    onSuccess: () => {
      setToken(null);
      queryClient.setQueryData(['session', null], null);
      queryClient.clear();
    }
  });

  const auth = {
    user: sessionQuery.data || null,
    token,
    mfaPrompt,
    isLoading: isDetecting || sessionQuery.isLoading || loginMutation.isPending || logoutMutation.isPending || verifyMfaMutation.isPending,
    login: async (username, password) => loginMutation.mutateAsync({ username, password }),
    verifyMfa: async (code) => verifyMfaMutation.mutateAsync({ code }),
    cancelMfa: () => {
      setMfaPrompt(false);
      setTempToken(null);
    },
    logout: async () => logoutMutation.mutateAsync()
  };

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
