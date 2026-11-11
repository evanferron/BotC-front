import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import type { JoinGameResponse } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const joinGame = async (roomCode: string) =>
  (await axiosInstance.post<JoinGameResponse>(GAMES_ENDPOINTS.join, { room_code: roomCode })).data;

// Les erreurs (code inconnu, table pleine…) sont affichées par l'écran, sous le champ
export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGame,
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de rejoindre la partie :', error);
    },
    onSuccess: ({ game }) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};
