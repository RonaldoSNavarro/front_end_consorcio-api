import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { setGlobalToken } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useOidcAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // Extrair roles do JWT (Keycloak default)
      let role = 'CONSORCIADO'; // default fallback
      if (auth.user.profile.realm_access && auth.user.profile.realm_access.roles) {
        const roles = auth.user.profile.realm_access.roles;
        // Priorizar role mais alta para a propriedade legado
        if (roles.includes('ADMIN')) role = 'ADMIN';
        else if (roles.includes('COMPLIANCE')) role = 'COMPLIANCE';
        else if (roles.includes('GESTOR')) role = 'GESTOR';
        else if (roles.includes('AUDITOR')) role = 'AUDITOR';
      }

      setUser({
        username: auth.user.profile.preferred_username,
        role: role,
        roles: auth.user.profile.realm_access?.roles || [],
        nome: auth.user.profile.given_name || auth.user.profile.preferred_username,
        email: auth.user.profile.email,
        sub: auth.user.profile.sub
      });
      setGlobalToken(auth.user.access_token);
    } else {
      setUser(null);
      setGlobalToken(null);
    }
  }, [auth.isAuthenticated, auth.user]);

  const authContextValue = {
    user,
    token: auth.user?.access_token || null,
    isLoading: auth.isLoading || auth.activeNavigator === 'signinSilent',
    login: async () => {
      // Ignora parâmetros (username/password) pois o Keycloak que fará a captura
      await auth.signinRedirect();
    },
    logout: async () => {
      await auth.signoutRedirect();
    },
    error: auth.error
  };

  return (
    <AuthContext.Provider value={authContextValue}>
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
