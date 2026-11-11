import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, GAME_POLLING_INTERVAL } from '@/constants/QUERY';
import type { PlayerMessage } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getMessages = async (gameId: string) =>
  (await axiosInstance.get<PlayerMessage[]>(GAMES_ENDPOINTS.messages(gameId))).data;

// Messages reçus du conteur, du plus ancien au plus récent
export const useMessagesQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.messages(gameId ?? ''),
    queryFn: () => getMessages(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? GAME_POLLING_INTERVAL : false,
  });
