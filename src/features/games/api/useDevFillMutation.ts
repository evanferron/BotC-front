import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const devFill = async (gameId: string) =>
  (await axiosInstance.post<Player[]>(GAMES_ENDPOINTS.devFill(gameId))).data;

/**
 * Développement uniquement : complète la table avec les comptes de test (joueur1, joueur2…),
 * pour tester une partie seul.
 */
export const useDevFillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: devFill,
    onError: (error) => {
      showError('Impossible de compléter la table');
      console.error('Impossible de compléter la table :', error);
    },
    onSuccess: (players, gameId) => {
      queryClient.setQueryData(GAMES_KEYS.players(gameId), players);
      showSuccess('Table complétée avec les comptes de test');
    },
  });
};
