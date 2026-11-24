import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';
import { gamePollingInterval } from '../utils/realtime.utils';

const getPlayers = async (gameId: string) =>
  (await axiosInstance.get<Player[]>(GAMES_ENDPOINTS.players(gameId))).data;

/**
 * Joueurs de la partie, dans l'ordre d'arrivée.
 * `polling` : relit la liste régulièrement (lobby), en attendant le temps réel.
 */
export const usePlayersQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.players(gameId ?? ''),
    queryFn: () => getPlayers(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    meta: { errorMessage: 'Impossible de récupérer les joueurs' },
  });
