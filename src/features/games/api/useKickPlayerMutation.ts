import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { showError, showSuccess } from '@/services/toast.service';
import type { Player } from '../types/game.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface KickPlayerPayload {
  gameId: string;
  player: Player;
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
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.players(gameId) });
    },
  });
};
