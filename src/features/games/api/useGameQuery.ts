import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import {
  DEFAULT_QUERY_GC_TIME,
  DEFAULT_QUERY_STALE_TIME,
  GAME_POLLING_INTERVAL,
} from '@/constants/QUERY';
import type { Game, GameStatus } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

// Tant que la partie n'est pas finie, on surveille le passage à la phase suivante
const isPolledStatus = (status: GameStatus | undefined) => !!status && status !== 'Ended';

const getGame = async (id: string) =>
  (await axiosInstance.get<Game>(GAMES_ENDPOINTS.game(id))).data;

/**
 * Partie courante. Tant qu'elle n'est pas finie, elle est relue régulièrement pour voir
 * le changement de phase (en attendant le temps réel). Pas de toast d'erreur : la page affiche « partie introuvable ».
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
        ? GAME_POLLING_INTERVAL
        : false,
  });
