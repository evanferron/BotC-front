import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import type { CompositionSuggestion } from '../types/composition.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getSuggestions = async (gameId: string) =>
  (await axiosInstance.get<CompositionSuggestion[]>(GAMES_ENDPOINTS.compositionSuggestions(gameId)))
    .data;

// Conteur : compositions conseillées (ex. « Découverte » pour les débutants)
export const useCompositionSuggestionsQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.compositionSuggestions(gameId),
    queryFn: () => getSuggestions(gameId),
    // Elles ne dépendent que du script et du nombre de joueurs, fixés à la création
    staleTime: Infinity,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire les compositions conseillées' },
  });
