import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import type { Game } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const startGame = async (gameId: string) =>
  (await axiosInstance.post<Game>(GAMES_ENDPOINTS.start(gameId))).data;

// Le conteur lance la partie : passage en distribution
export const useStartGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startGame,
    onError: (error) => {
      showError('Impossible de lancer la partie');
      if (ENV === 'DEV') console.error('Impossible de lancer la partie :', error);
    },
    onSuccess: (game) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};
