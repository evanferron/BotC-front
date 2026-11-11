import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { showError } from '@/services/toast.service';
import type { StepChoice } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface RespondPayload {
  gameId: string;
  choice: StepChoice;
}

const respond = async ({ gameId, choice }: RespondPayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.respond(gameId), choice);
};

// Joueur : envoie son choix au conteur. Pas d'accusé visible : l'écran retombe sur l'attente.
export const useRespondMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respond,
    onError: (error) => {
      showError("Votre choix n'a pas pu être envoyé");
      if (ENV === 'DEV') console.error("Impossible d'envoyer le choix :", error);
    },
    onSettled: (_data, _error, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.prompt(gameId) }),
  });
};
