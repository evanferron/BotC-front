import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@/constants/QUERY';
import type { Night } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getNight = async (gameId: string) =>
  (await axiosInstance.get<Night>(GAMES_ENDPOINTS.night(gameId))).data;

/**
 * Étapes de la nuit, réservé au conteur.
 * `polling` : relit la nuit pour voir arriver les choix des joueurs, en attendant le temps réel.
 */
export const useNightQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.night(gameId ?? ''),
    queryFn: () => getNight(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? GAME_POLLING_INTERVAL : false,
    meta: { errorMessage: 'Impossible de récupérer la nuit' },
  });
