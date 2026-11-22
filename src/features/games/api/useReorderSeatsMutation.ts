import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { getErrorCode } from '@common/api/errors';
import { showError } from '@common/utils/toast.utils';
import type { GrimoirePlayer } from '../types/grimoire.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface ReorderSeatsPayload {
  gameId: string;
  // Tous les joueurs, dans le sens des aiguilles d'une montre : le premier prend la place 1
  playerIds: string[];
}

const reorderSeats = async ({ gameId, playerIds }: ReorderSeatsPayload) =>
  (
    await axiosInstance.put<GrimoirePlayer[]>(GAMES_ENDPOINTS.seats(gameId), {
      player_ids: playerIds,
    })
  ).data;

// Conteur : reproduire l'ordre réel de la table
export const useReorderSeatsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderSeats,
    onError: (error) => {
      showError(
        getErrorCode(error) === 'WRONG_PHASE'
          ? 'La table se réorganise entre la distribution et la fin de la partie'
          : 'Impossible d’enregistrer l’ordre de la table'
      );
      if (ENV === 'DEV') console.error('Réorganisation impossible :', error);
    },
    onSuccess: (grimoire, { gameId }) => {
      // Le grimoire revient déjà dans le nouvel ordre : pas d'aller-retour pour l'afficher
      queryClient.setQueryData(GAMES_KEYS.grimoire(gameId), grimoire);
      // Listes des joueurs, jour, nuit : tout ce qui est trié par place
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) });
    },
  });
};
