import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME, DEFAULT_QUERY_STALE_TIME } from '@common/api/query';
import type { Game, GameStatus } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';
import { gamePollingInterval } from '../utils/realtime.utils';

// Une partie finie ne change plus de phase : inutile de la relire
const isPolledStatus = (status: GameStatus | undefined) => !!status && status !== 'Ended';

const getGame = async (id: string) =>
  (await axiosInstance.get<Game>(GAMES_ENDPOINTS.game(id))).data;

/**
 * Partie courante, rechargée à chaque signal du temps réel (`useGameRealtime`). Si la connexion
 * temps réel est coupée et que la partie n'est pas finie, elle est relue régulièrement pour ne pas
 * manquer le changement de phase. Pas de toast d'erreur : la page affiche « partie introuvable ».
 */
export const useGameQuery = (id: string | undefined) =>
  useQuery({
    queryKey: GAMES_KEYS.details(id ?? ''),
    queryFn: () => getGame(id ?? ''),
    enabled: !!id,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      query.state.status !== 'error' && isPolledStatus(query.state.data?.status)
        ? gamePollingInterval(id)
        : false,
  });
