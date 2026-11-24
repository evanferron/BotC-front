import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { GrimoirePlayer } from '../types/grimoire.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getGrimoire = async (gameId: string) =>
  (await axiosInstance.get<GrimoirePlayer[]>(GAMES_ENDPOINTS.grimoire(gameId))).data;

// Conteur : état complet de chaque joueur, relu à chaque ouverture du grimoire
export const useGrimoireQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.grimoire(gameId),
    queryFn: () => getGrimoire(gameId),
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire le grimoire' },
  });
