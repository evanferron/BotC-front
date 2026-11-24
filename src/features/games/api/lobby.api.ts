// Lobby : lancement de la partie et remplissage de développement.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { ENV } from '@common/config/api.config';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { Game, Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const startGame = async (gameId: string) =>
  (await axiosInstance.post<Game>(GAMES_ENDPOINTS.start(gameId))).data;

// Le conteur lance la partie : passage en distribution
export const useStartGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startGame,
    onError: (error) => {
      showError('Impossible de lancer la partie');
      if (ENV === 'DEV') console.error('Impossible de lancer la partie :', error);
    },
    onSuccess: (game) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};

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
