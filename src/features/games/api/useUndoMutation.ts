import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { getErrorCode } from '@common/api/errors';
import { showError } from '@common/utils/toast.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const undo = async (gameId: string) =>
  (await axiosInstance.post<{ label: string }>(GAMES_ENDPOINTS.undo(gameId))).data;

// Conteur : annuler sa dernière action (la partie revient à l'état d'avant)
export const useUndoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: undo,
    onError: (error) => {
      showError(
        getErrorCode(error) === 'NOTHING_TO_UNDO'
          ? 'Il n’y a plus rien à annuler'
          : 'Impossible d’annuler cette action'
      );
      if (ENV === 'DEV') console.error('Annulation impossible :', error);
    },
    // Tout peut avoir changé : phase, joueurs, nuit, jour, grimoire, journal
    onSuccess: (_data, gameId) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
