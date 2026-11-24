import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import type { EndGamePayload } from '../types/end.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const endGame = async ({ gameId, winner, reason }: EndGamePayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.end(gameId), { winner, reason });
};

// Conteur : déclarer la fin (ou changer le camp d'une partie terminée)
export const useEndGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endGame,
    onError: (error) => {
      showError('Impossible de terminer la partie');
      if (ENV === 'DEV') console.error('Impossible de terminer la partie :', error);
    },
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
