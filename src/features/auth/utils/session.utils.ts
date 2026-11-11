import type { QueryClient } from '@tanstack/react-query';
import { AUTH_KEYS } from '../api/AUTH_CONF';

/**
 * Vide la session et toutes les données du compte.
 * La requête de session reste dans le cache (à null) : AuthProvider l'observe toujours,
 * un `queryClient.clear()` la retirerait et le login suivant ne serait plus vu.
 */
export const clearSession = (queryClient: QueryClient) => {
  const sessionKey = AUTH_KEYS.session();
  queryClient.setQueryData(sessionKey, null);
  queryClient.removeQueries({
    predicate: (query) => JSON.stringify(query.queryKey) !== JSON.stringify(sessionKey),
  });
};
