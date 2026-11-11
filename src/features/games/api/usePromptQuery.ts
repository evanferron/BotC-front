import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@/constants/QUERY';
import type { NightPrompt } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getPrompt = async (gameId: string) =>
  (await axiosInstance.get<NightPrompt>(GAMES_ENDPOINTS.prompt(gameId))).data;

/**
 * Demande en cours du joueur (null le plus souvent). Tous les joueurs la relisent au même
 * rythme pendant la nuit : le trafic ne trahit pas qui est réveillé.
 */
export const usePromptQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.prompt(gameId ?? ''),
    queryFn: () => getPrompt(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? GAME_POLLING_INTERVAL : false,
  });
