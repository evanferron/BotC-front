import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface EndNightPayload {
  gameId: string;
  // Joueurs morts cette nuit
  deaths: string[];
}

const endNight = async ({ gameId, deaths }: EndNightPayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.nightEnd(gameId), { deaths });
};

// Conteur : lever le jour, en annonçant les morts de la nuit
export const useEndNightMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endNight,
    onError: (error) => {
      showError('Impossible de lever le jour');
      if (ENV === 'DEV') console.error('Impossible de lever le jour :', error);
    },
    // La partie, les joueurs (morts) et la nuit changent
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
