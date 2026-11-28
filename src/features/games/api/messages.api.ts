// Messages privés du conteur vers un joueur.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { PlayerMessage, SendMessagePayload } from '../types/night.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getMessages = async (gameId: string) =>
  (await axiosInstance.get<PlayerMessage[]>(GAMES_ENDPOINTS.messages(gameId))).data;

// Messages reçus du conteur, du plus ancien au plus récent
export const useMessagesQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.messages(gameId ?? ''),
    queryFn: () => getMessages(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
  });

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

interface SendMessageArgs {
  gameId: string;
  playerId: string;
  // Pseudo du destinataire, pour le toast de confirmation
  pseudo: string;
  message: SendMessagePayload;
}

const sendMessage = async ({ gameId, playerId, message }: SendMessageArgs) =>
  (await axiosInstance.post<PlayerMessage>(GAMES_ENDPOINTS.sendMessage(gameId, playerId), message))
    .data;

// Conteur : information privée envoyée à un joueur
export const useSendMessageMutation = () =>
  useMutation({
    mutationFn: sendMessage,
    onError: (error) => {
      showError("L'information n'a pas pu être envoyée");
      if (ENV === 'DEV') console.error("Impossible d'envoyer l'information :", error);
    },
    onSuccess: (_data, { pseudo }) => showSuccess(`Information envoyée à ${pseudo}`),
  });
