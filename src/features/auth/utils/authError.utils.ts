import { getErrorStatus, isNetworkError } from '@/utils/api.utils';

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Pseudo ou mot de passe incorrect.',
  PSEUDO_TAKEN: 'Ce pseudo est déjà pris. Connectez-vous plutôt.',
  TOO_MANY_REQUESTS: 'Trop de tentatives. Réessayez dans une minute.',
  NETWORK: 'Serveur injoignable. Vérifiez votre connexion.',
  UNKNOWN: 'Une erreur est survenue. Réessayez.',
} as const;

// Message commun aux erreurs qui ne dépendent pas du formulaire
export const getCommonAuthError = (error: unknown): string => {
  if (isNetworkError(error)) return AUTH_ERROR_MESSAGES.NETWORK;
  if (getErrorStatus(error) === 429) return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
  return AUTH_ERROR_MESSAGES.UNKNOWN;
};
