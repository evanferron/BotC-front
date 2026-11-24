import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { Journal } from '../types/journal.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';
import { gamePollingInterval } from '../utils/realtime.utils';

const getJournal = async (gameId: string) =>
  (await axiosInstance.get<Journal>(GAMES_ENDPOINTS.journal(gameId))).data;

// Conteur : journal complet, relu en continu tant qu'il est ouvert
export const useJournalQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.journal(gameId),
    queryFn: () => getJournal(gameId),
    refetchInterval: (query) =>
      query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire le journal' },
  });
