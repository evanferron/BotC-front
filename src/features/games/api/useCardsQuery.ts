import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@/constants/QUERY';
import type { Distribution } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

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
      polling && query.state.status !== 'error' ? GAME_POLLING_INTERVAL : false,
    meta: { errorMessage: 'Impossible de récupérer les cartes' },
  });
