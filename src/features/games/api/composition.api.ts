// Composition choisie par le conteur pendant le lobby.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorCode, type ErrorCode } from '@common/api/errors';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type {
  Composition,
  CompositionSuggestion,
  CompositionCard,
} from '../types/composition.types';
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

const drawComposition = async (gameId: string) =>
  (await axiosInstance.post<{ cards: CompositionCard[] }>(GAMES_ENDPOINTS.compositionDraw(gameId)))
    .data.cards;

// Conteur : tirage au hasard à retoucher ; rien n'est enregistré côté serveur
export const useDrawCompositionMutation = () =>
  useMutation({
    mutationFn: drawComposition,
    onError: (error) => {
      showError('Impossible de tirer une composition');
      if (ENV === 'DEV') console.error('Tirage impossible :', error);
    },
  });

interface SetCompositionPayload {
  gameId: string;
  // Liste vide : tirage au hasard au lancement
  cards: CompositionCard[];
}

const setComposition = async ({ gameId, cards }: SetCompositionPayload) =>
  (await axiosInstance.put<Composition>(GAMES_ENDPOINTS.composition(gameId), { cards })).data;

const ERROR_MESSAGES: Partial<Record<ErrorCode, string>> = {
  WRONG_PHASE: 'La composition se choisit avant le lancement',
  INVALID_COMPOSITION: 'Cette composition ne peut pas être jouée',
};

// Conteur : choisir les rôles en jeu pendant le lobby
export const useSetCompositionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setComposition,
    onError: (error) => {
      const code = getErrorCode(error);
      showError((code && ERROR_MESSAGES[code]) ?? 'Impossible d’enregistrer la composition');
      if (ENV === 'DEV') console.error('Composition refusée :', error);
    },
    onSuccess: (composition, { gameId }) =>
      queryClient.setQueryData(GAMES_KEYS.composition(gameId), composition),
  });
};
