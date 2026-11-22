import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { Composition } from '../types/composition.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getComposition = async (gameId: string) =>
  (await axiosInstance.get<Composition>(GAMES_ENDPOINTS.composition(gameId))).data;

// Conteur : composition choisie (ou tirage au hasard) et répartition conseillée
export const useCompositionQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.composition(gameId),
    queryFn: () => getComposition(gameId),
    // Seul le conteur la modifie : pas besoin de la relire en boucle
    staleTime: Infinity,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire la composition' },
  });
