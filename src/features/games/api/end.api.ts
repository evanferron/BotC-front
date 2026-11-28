// Fin de partie : déclaration du vainqueur et récapitulatif.

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type { EndGamePayload, GameSummary } from '../types/end.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const endGame = async ({ gameId, winner, reason }: EndGamePayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.end(gameId), { winner, reason });
};

// Conteur : déclarer la fin (ou changer le camp d'une partie terminée)
export const useEndGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endGame,
    onError: (error) => {
      showError('Impossible de terminer la partie');
      if (ENV === 'DEV') console.error('Impossible de terminer la partie :', error);
    },
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};

const getSummary = async (gameId: string) =>
  (await axiosInstance.get<GameSummary>(GAMES_ENDPOINTS.summary(gameId))).data;

// Récapitulatif d'une partie terminée : camp vainqueur et rôles révélés.
// Relu régulièrement : le conteur peut encore changer le camp tant que la table est ouverte.
export const useSummaryQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.summary(gameId),
    queryFn: () => getSummary(gameId),
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.status !== 'error' ? gamePollingInterval(gameId, 3) : false,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de récupérer le récapitulatif' },
  });
