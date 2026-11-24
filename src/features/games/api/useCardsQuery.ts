import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { Distribution } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';
import { gamePollingInterval } from '../utils/realtime.utils';

const getCards = async (gameId: string) =>
  (await axiosInstance.get<Distribution>(GAMES_ENDPOINTS.cards(gameId))).data;

/**
 * Cartes de la distribution, selon le lecteur (rôles inclus pour le conteur seulement).
 * `polling` : relit l'état régulièrement pendant la distribution, en attendant le temps réel.
 */
export const useCardsQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.cards(gameId ?? ''),
    queryFn: () => getCards(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    meta: { errorMessage: 'Impossible de récupérer les cartes' },
  });
