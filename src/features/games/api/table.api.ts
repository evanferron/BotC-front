// Gestion de la table : pause, passation, fermeture, départs et exclusions.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { ENV } from '@common/config/api.config';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

// Actions du conteur sur la table en cours de partie (design/C7 23d à 23g)

const useTableMutation = <T>(
  request: (payload: T) => Promise<unknown>,
  gameIdOf: (payload: T) => string,
  errorMessage: string,
  successMessage?: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onError: (error) => {
      showError(errorMessage);
      if (ENV === 'DEV') console.error(`${errorMessage} :`, error);
    },
    onSuccess: (_data, payload) => {
      if (successMessage) showSuccess(successMessage);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameIdOf(payload)) });
    },
  });
};

export const usePauseMutation = () =>
  useTableMutation(
    (gameId: string) => axiosInstance.post(GAMES_ENDPOINTS.pause(gameId)),
    (gameId) => gameId,
    'Impossible de mettre la partie en pause'
  );

export const useResumeMutation = () =>
  useTableMutation(
    (gameId: string) => axiosInstance.post(GAMES_ENDPOINTS.resume(gameId)),
    (gameId) => gameId,
    'Impossible de reprendre la partie'
  );

interface TransferPayload {
  gameId: string;
  playerId: string;
  pseudo: string;
}

// Le conteur passe la main : il n'a plus accès à la partie ensuite
export const useTransferStorytellerMutation = () =>
  useTableMutation(
    ({ gameId, playerId }: TransferPayload) =>
      axiosInstance.post(GAMES_ENDPOINTS.storyteller(gameId), { player_id: playerId }),
    ({ gameId }) => gameId,
    'Impossible de transférer le rôle de Conteur'
  );

export const useCloseTableMutation = () =>
  useTableMutation(
    (gameId: string) => axiosInstance.post(GAMES_ENDPOINTS.close(gameId)),
    (gameId) => gameId,
    'Impossible de fermer la table',
    'Table fermée'
  );

interface KickPlayerPayload {
  gameId: string;
  player: Pick<Player, 'id' | 'pseudo'>;
}

const kickPlayer = async ({ gameId, player }: KickPlayerPayload) => {
  await axiosInstance.delete(GAMES_ENDPOINTS.player(gameId, player.id));
};

export const useKickPlayerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kickPlayer,
    onError: (error, { player }) => {
      showError(`Impossible d'exclure ${player.pseudo}`);
      if (ENV === 'DEV') console.error("Impossible d'exclure le joueur :", error);
    },
    onSuccess: (_data, { gameId, player }) => {
      showSuccess(`${player.pseudo} a quitté la table`);
      // En cours de partie, le grimoire et la nuit montrent aussi le départ
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) });
    },
  });
};

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
