import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import type { PlayerMessage } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface ReadMessagePayload {
  gameId: string;
  messageId: string;
}

const readMessage = async ({ gameId, messageId }: ReadMessagePayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.readMessage(gameId, messageId));
};

// Joueur : « Compris ». Le message disparaît tout de suite de l'écran.
export const useReadMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readMessage,
    onMutate: ({ gameId, messageId }) => {
      queryClient.setQueryData<PlayerMessage[]>(GAMES_KEYS.messages(gameId), (messages) =>
        messages?.map((m) =>
          m.id === messageId ? { ...m, read_at: m.read_at ?? new Date().toISOString() } : m
        )
      );
    },
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de marquer le message comme lu :', error);
    },
    onSettled: (_data, _error, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.messages(gameId) }),
  });
};
