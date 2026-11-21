import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const startNight = async (gameId: string) => {
  await axiosInstance.post(GAMES_ENDPOINTS.nightStart(gameId));
};

// Conteur : faire tomber la nuit depuis le jour
export const useStartNightMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startNight,
    onError: (error) => {
      showError('Impossible de faire tomber la nuit');
      if (ENV === 'DEV') console.error('Impossible de faire tomber la nuit :', error);
    },
    onSuccess: (_data, gameId) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
