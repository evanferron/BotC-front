import { getApiErrorMessage, getErrorStatus, isNetworkError } from '@/utils/api.utils';

export const JOIN_ERROR_MESSAGES = {
  NOT_FOUND: "Ce code n'ouvre aucune table. Vérifiez-le auprès du Conteur.",
  FULL: 'Cette table est complète.',
  STARTED: 'La partie a déjà commencé : il n’est plus possible de la rejoindre.',
  STORYTELLER: 'Vous êtes le Conteur de cette table : ouvrez-la depuis vos parties.',
  NETWORK: 'Serveur injoignable. Vérifiez votre connexion.',
  UNKNOWN: 'Impossible de rejoindre la table. Réessayez.',
} as const;

/**
 * Message affiché sous le champ du code.
 * L'API renvoie la même erreur 409 pour plusieurs cas : on les distingue par son message.
 */
export const getJoinErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) return JOIN_ERROR_MESSAGES.NETWORK;

  const status = getErrorStatus(error);
  if (status === 404 || status === 400) return JOIN_ERROR_MESSAGES.NOT_FOUND;
  if (status === 409) {
    const message = getApiErrorMessage(error)?.toLowerCase() ?? '';
    if (message.includes('full')) return JOIN_ERROR_MESSAGES.FULL;
    if (message.includes('started')) return JOIN_ERROR_MESSAGES.STARTED;
    if (message.includes('storyteller')) return JOIN_ERROR_MESSAGES.STORYTELLER;
  }
  return JOIN_ERROR_MESSAGES.UNKNOWN;
};
