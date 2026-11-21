import type { HttpAuth } from '@common/api/http';
import { emitAuthEvent } from '../utils/authEvent.utils';
import { getAccessToken } from '../utils/token.utils';
import { refreshAccessToken } from './refreshAccessToken';

/**
 * Branchement de l'authentification sur le client HTTP partagé (common/api/http.ts).
 * Passé à `configureHttpAuth` par app/ au démarrage.
 */
export const httpAuth: HttpAuth = {
  getToken: getAccessToken,
  refresh: refreshAccessToken,
  onExpired: () => emitAuthEvent('EXPIRED'),
  isAuthRequest: (url) => url.startsWith('/auth/'),
};
