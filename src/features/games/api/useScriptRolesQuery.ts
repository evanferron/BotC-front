import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME } from '@/constants/QUERY';
import type { RoleSummary } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getRoles = async (gameId: string) =>
  (await axiosInstance.get<RoleSummary[]>(GAMES_ENDPOINTS.roles(gameId))).data;

// Rôles du script de la partie : ils ne changent pas pendant la partie
export const useScriptRolesQuery = (gameId: string | undefined) =>
  useQuery({
    queryKey: GAMES_KEYS.roles(gameId ?? ''),
    queryFn: () => getRoles(gameId ?? ''),
    enabled: !!gameId,
    staleTime: Infinity,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de récupérer les rôles du script' },
  });
