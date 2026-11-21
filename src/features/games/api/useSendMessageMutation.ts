import { useMutation } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { PlayerMessage, SendMessagePayload } from '../types/night.types';
import { GAMES_ENDPOINTS } from './GAMES_CONF';

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
