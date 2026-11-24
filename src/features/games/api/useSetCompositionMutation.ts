import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { getErrorCode, type ErrorCode } from '@common/api/errors';
import { showError } from '@common/utils/toast.utils';
import type { Composition, CompositionCard } from '../types/composition.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

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
