import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { showError, showSuccess } from '@/services/toast.service';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const leaveGame = async (gameId: string) => {
  await axiosInstance.post(GAMES_ENDPOINTS.leave(gameId));
};

export const useLeaveGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGame,
    onError: (error) => {
      showError('Impossible de quitter la table');
      if (ENV === 'DEV') console.error('Impossible de quitter la partie :', error);
    },
    onSuccess: (_data, gameId) => {
      // La partie n'est plus lisible pour ce compte : on l'oublie plutôt que la relire (404)
      queryClient.removeQueries({ queryKey: GAMES_KEYS.details(gameId) });
      showSuccess('Vous avez quitté la table');
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};
