import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { getErrorCode } from '@common/api/errors';
import { showError } from '@common/utils/toast.utils';
import type { GrimoirePlayer, PlayerStateCorrection } from '../types/grimoire.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface CorrectPlayerPayload {
  gameId: string;
  playerId: string;
  correction: PlayerStateCorrection;
}

const correctPlayer = async ({ gameId, playerId, correction }: CorrectPlayerPayload) =>
  (
    await axiosInstance.put<GrimoirePlayer>(
      GAMES_ENDPOINTS.playerState(gameId, playerId),
      correction
    )
  ).data;

// Conteur : corriger l'état d'un joueur (journalisé côté serveur)
export const useCorrectPlayerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: correctPlayer,
    onError: (error) => {
      showError(
        getErrorCode(error) === 'WRONG_PHASE'
          ? 'Les corrections se font pendant la partie'
          : 'Impossible d’appliquer la correction'
      );
      if (ENV === 'DEV') console.error('Correction impossible :', error);
    },
    // Joueurs, jour, nuit, grimoire : tout ce qui dépend de l'état d'un joueur
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
