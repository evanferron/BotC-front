import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@common/api/query';
import type { GameSummary } from '../types/end.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

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
      query.state.status !== 'error' ? GAME_POLLING_INTERVAL * 3 : false,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de récupérer le récapitulatif' },
  });
