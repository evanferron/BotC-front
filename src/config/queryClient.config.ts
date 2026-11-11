import { QueryCache, QueryClient } from '@tanstack/react-query';
import { showError } from '@/services/toast.service';
import { getErrorStatus } from '@/utils/api.utils';

/**
 * Client TanStack Query de l'application.
 * Les erreurs de lecture sont affichées ici, une seule fois, avec le message `meta.errorMessage`
 * du hook. Le message sert d'id au toast : une même erreur n'est jamais affichée en double.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Pas de nouvel essai sur une erreur client (401, 404…) : seulement sur réseau ou 5xx
      retry: (failureCount, error) => {
        const status = getErrorStatus(error);
        if (status !== undefined && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const message = query.meta?.errorMessage;
      if (message) showError(message, { id: message });
    },
  }),
});
