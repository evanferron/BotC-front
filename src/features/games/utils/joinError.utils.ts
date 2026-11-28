import { getErrorCode, isNetworkError } from '@common/api/errors';

export const JOIN_ERROR_MESSAGES = {
  NOT_FOUND: "Ce code n'ouvre aucune table. Vérifiez-le auprès du Conteur.",
  FULL: 'Cette table est complète.',
  STARTED: 'La partie a déjà commencé : il n’est plus possible de la rejoindre.',
  STORYTELLER: 'Vous êtes le Conteur de cette table : ouvrez-la depuis vos parties.',
  REMOVED: 'Le Conteur vous a exclu de cette table.',
  NETWORK: 'Serveur injoignable. Vérifiez votre connexion.',
  UNKNOWN: 'Impossible de rejoindre la table. Réessayez.',
} as const;

// Message affiché sous le champ du code, selon le code d'erreur de l'API
export const getJoinErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) return JOIN_ERROR_MESSAGES.NETWORK;

  switch (getErrorCode(error)) {
    case 'ROOM_CODE_NOT_FOUND':
    case 'BAD_REQUEST':
    case 'VALIDATION_FAILED':
      return JOIN_ERROR_MESSAGES.NOT_FOUND;
    case 'GAME_FULL':
      return JOIN_ERROR_MESSAGES.FULL;
    case 'GAME_ALREADY_STARTED':
      return JOIN_ERROR_MESSAGES.STARTED;
    case 'REMOVED_FROM_GAME':
      return JOIN_ERROR_MESSAGES.REMOVED;
    // Seul conflit restant de POST /games/join : le conteur qui rejoint sa propre table
    case 'CONFLICT':
      return JOIN_ERROR_MESSAGES.STORYTELLER;
    default:
      return JOIN_ERROR_MESSAGES.UNKNOWN;
  }
};
