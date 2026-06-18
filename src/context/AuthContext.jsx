import React, { createContext, useContext } from 'react';
import { useAuthSource } from '../hooks/useAuth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthSource();

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
