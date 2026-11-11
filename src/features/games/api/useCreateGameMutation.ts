import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { showError } from '@/services/toast.service';
import type { CreateGamePayload, Game } from '../types/game.types';
import { GAMES_ENDPOINT, GAMES_KEYS } from './GAMES_CONF';

const createGame = async (payload: CreateGamePayload) =>
  (await axiosInstance.post<Game>(GAMES_ENDPOINT, payload)).data;

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGame,
    onError: (error) => {
      showError('Impossible de créer la partie');
      if (ENV === 'DEV') console.error('Impossible de créer la partie :', error);
    },
    onSuccess: (game) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};
