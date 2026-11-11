import { createContext, useContext } from 'react';
import type { User } from '../types/auth.types';

export interface AuthContextType {
  isAuthenticated: boolean;
  // Vrai pendant la reprise de session au chargement de l'application
  isLoading: boolean;
  userId: string | undefined;
  // Profil du compte (pseudo), chargé après la session
  user: User | undefined;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
