// Grimoire du conteur : état des joueurs, corrections, ordre de la table.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorCode } from '@common/api/errors';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type { GrimoirePlayer, PlayerStateCorrection } from '../types/grimoire.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getGrimoire = async (gameId: string) =>
  (await axiosInstance.get<GrimoirePlayer[]>(GAMES_ENDPOINTS.grimoire(gameId))).data;

// Conteur : état complet de chaque joueur, relu à chaque ouverture du grimoire
export const useGrimoireQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.grimoire(gameId),
    queryFn: () => getGrimoire(gameId),
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire le grimoire' },
  });

interface CorrectPlayerPayload {
  gameId: string;
  playerId: string;
  correction: PlayerStateCorrection;
}

const correctPlayer = async ({ gameId, playerId, correction }: CorrectPlayerPayload) =>
  (
    await axiosInstance.put<GrimoirePlayer>(
      GAMES_ENDPOINTS.playerState(gameId, playerId),
      correction
    )
  ).data;

// Conteur : corriger l'état d'un joueur (journalisé côté serveur)
export const useCorrectPlayerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: correctPlayer,
    onError: (error) => {
      showError(
        getErrorCode(error) === 'WRONG_PHASE'
          ? 'Les corrections se font pendant la partie'
          : 'Impossible d’appliquer la correction'
      );
      if (ENV === 'DEV') console.error('Correction impossible :', error);
    },
    // Joueurs, jour, nuit, grimoire : tout ce qui dépend de l'état d'un joueur
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};

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
