import React, { useEffect, useState } from 'react';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { api } from '../services/api';

export const OidcAuthProvider = ({ children }) => {
  const [oidcConfig, setOidcConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/auth/keycloak-config');
        if (!response.ok) throw new Error('Falha ao obter configuração do Keycloak');
        
        const configData = await response.json();
        
        const config = {
          authority: `${configData.url}/realms/${configData.realm}`,
          client_id: configData.clientId,
          redirect_uri: window.location.origin + '/',
          post_logout_redirect_uri: window.location.origin + '/login',
          response_type: 'code',
          scope: 'openid profile email', // Keycloak mapeará os client scopes automaticamente
          userStore: new WebStorageStateStore({ store: window.localStorage }),
          automaticSilentRenew: true,
          onSigninCallback: () => {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        };
        
        setOidcConfig(config);
      } catch (err) {
        console.error('Erro de configuração OIDC:', err);
        setError('Não foi possível conectar ao servidor de autenticação.');
      }
    };
    
    fetchConfig();
  }, []);

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-red-500">{error}</div>;
  }

  if (!oidcConfig) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Carregando configurações de segurança...</div>;
  }

  return (
    <AuthProvider {...oidcConfig}>
      {children}
    </AuthProvider>
  );
};
