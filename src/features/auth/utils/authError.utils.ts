import { getErrorCode, isNetworkError } from '@common/api/errors';

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Pseudo ou mot de passe incorrect.',
  PSEUDO_TAKEN: 'Ce pseudo est déjà pris. Connectez-vous plutôt.',
  TOO_MANY_REQUESTS: 'Trop de tentatives. Réessayez dans une minute.',
  NETWORK: 'Serveur injoignable. Vérifiez votre connexion.',
  ACCOUNT_CREATED: 'Votre compte est créé. Connectez-vous pour continuer.',
  UNKNOWN: 'Une erreur est survenue. Réessayez.',
} as const;

/**
 * L'inscription a réussi mais la connexion qui la suit a échoué (réseau, limite de débit) :
 * le compte existe, il ne faut surtout pas proposer de le recréer.
 */
export class AccountCreatedError extends Error {
  constructor(cause: unknown) {
    super('Compte créé, connexion impossible', { cause });
    this.name = 'AccountCreatedError';
  }
}

// Message commun aux erreurs qui ne dépendent pas du formulaire
export const getCommonAuthError = (error: unknown): string => {
  if (isNetworkError(error)) return AUTH_ERROR_MESSAGES.NETWORK;
  if (getErrorCode(error) === 'RATE_LIMITED') return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
  return AUTH_ERROR_MESSAGES.UNKNOWN;
};
