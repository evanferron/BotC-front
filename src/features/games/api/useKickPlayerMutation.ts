import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError, showSuccess } from '@common/utils/toast.utils';
import type { Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

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
