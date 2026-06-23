import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, detectBackend } from '../services/api';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook de origem que gerencia todo o estado de autenticação via TanStack Query.
 * Usado pelo AuthProvider para compartilhar o estado globalmente.
 */
export function useAuthSource() {
  const queryClient = useQueryClient();
  const [isMockMode, setIsMockMode] = useState(true);
  const [token, setToken] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const init = async () => {
      const isMock = await detectBackend();
      setIsMockMode(isMock);
      api.setMockMode(isMock);

      if (isMock) {
        // Modo Mock: JWT mantido apenas em memory state (não persistido)
        // Ao atualizar a página, será necessário autenticar novamente.
      } else {
        try {
          await api.obterUsuarioLogado();
          setToken('cookie_managed');
        } catch {
          setToken(null);
        }
      }
      setIsDetecting(false);
    };
    init();
  }, []);

  const sessionQuery = useQuery({
    queryKey: ['session', isMockMode, token],
    queryFn: async () => {
      if (isMockMode) {
        if (!token) return null;
        try {
          const savedUser = localStorage.getItem('consorcio_api_user');
          return savedUser ? JSON.parse(savedUser) : { login: "admin", role: "ADMIN", nome: "Ronaldo Navarro", email: "ronaldo@dev.com", isMock: true };
        } catch (e) {
          return { login: "admin", role: "ADMIN", nome: "Ronaldo Navarro", email: "ronaldo@dev.com", isMock: true };
        }
      }
      return api.obterUsuarioLogado();
    },
    enabled: !isDetecting && (!isMockMode || !!token),
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      return api.login(username, password);
    },
    onSuccess: async (res, variables) => {
      setToken(res.token); // Atualiza o memory state
      if (isMockMode) {
        try {
          // Nunca salvar JWT no LocalStorage. Apenas mock profile info
          const userData = {
            login: variables.username,
            role: variables.username === 'admin' ? 'ADMIN' : 'OPERADOR',
            nome: "Ronaldo Navarro",
            email: "ronaldo@dev.com",
            isMock: true
          };
          localStorage.setItem('consorcio_api_user', JSON.stringify(userData));
          queryClient.setQueryData(['session', isMockMode, res.token], userData);
        } catch (e) {
          console.warn("Storage write blocked:", e);
        }
      } else {
        await queryClient.invalidateQueries({ queryKey: ['session'] });
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.logout();
    },
    onSuccess: () => {
      setToken(null);
      try {
        localStorage.removeItem('consorcio_api_user');
      } catch (e) {
        console.warn("Storage write blocked:", e);
      }
      queryClient.setQueryData(['session', isMockMode, token], null);
      queryClient.clear();
    }
  });

  const toggleMockMode = () => {
    const newMock = !isMockMode;
    setIsMockMode(newMock);
    api.setMockMode(newMock);
    setToken(null);
    try {
      localStorage.removeItem('consorcio_api_user');
    } catch (e) {}
    queryClient.clear();
    return newMock;
  };

  return {
    user: sessionQuery.data || null,
    token,
    isMockMode,
    isLoading: isDetecting || sessionQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    login: async (username, password) => loginMutation.mutateAsync({ username, password }),
    logout: async () => logoutMutation.mutateAsync(),
    toggleMockMode
  };
}

/**
 * Hook para consumo de autenticação e sessão nos componentes.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
