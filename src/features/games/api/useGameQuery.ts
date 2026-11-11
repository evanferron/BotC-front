import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import {
  DEFAULT_QUERY_GC_TIME,
  DEFAULT_QUERY_STALE_TIME,
  GAME_POLLING_INTERVAL,
} from '@/constants/QUERY';
import type { Game } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getGame = async (id: string) =>
  (await axiosInstance.get<Game>(GAMES_ENDPOINTS.game(id))).data;

/**
 * Partie courante. Pendant le lobby, elle est relue régulièrement pour voir le lancement
 * (en attendant le temps réel). Pas de toast d'erreur : la page affiche « partie introuvable ».
 */
export const useGameQuery = (id: string | undefined) =>
  useQuery({
    queryKey: GAMES_KEYS.details(id ?? ''),
    queryFn: () => getGame(id ?? ''),
    enabled: !!id,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      query.state.status !== 'error' && query.state.data?.status === 'Lobby'
        ? GAME_POLLING_INTERVAL
        : false,
  });
