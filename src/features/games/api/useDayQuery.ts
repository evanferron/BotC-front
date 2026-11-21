import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@common/api/query';
import type { Day } from '../types/day.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getDay = async (gameId: string) =>
  (await axiosInstance.get<Day>(GAMES_ENDPOINTS.day(gameId))).data;

/**
 * Jour en cours : nominations, votes en direct, seuil et échafaud. Relu régulièrement
 * pendant le jour, en attendant le temps réel.
 */
export const useDayQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.day(gameId),
    queryFn: () => getDay(gameId),
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) => (query.state.status !== 'error' ? GAME_POLLING_INTERVAL : false),
    meta: { errorMessage: 'Impossible de récupérer le jour' },
  });
