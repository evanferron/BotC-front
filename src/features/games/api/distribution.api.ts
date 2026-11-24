// Distribution : cartes face cachée et choix à tour de rôle.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorCode } from '@common/api/errors';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type { Distribution, PickCardResponse } from '../types/game.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getCards = async (gameId: string) =>
  (await axiosInstance.get<Distribution>(GAMES_ENDPOINTS.cards(gameId))).data;

/**
 * Cartes de la distribution, selon le lecteur (rôles inclus pour le conteur seulement).
 * `polling` : relit l'état régulièrement pendant la distribution, en attendant le temps réel.
 */
export const useCardsQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.cards(gameId ?? ''),
    queryFn: () => getCards(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    meta: { errorMessage: 'Impossible de récupérer les cartes' },
  });

interface PickCardPayload {
  gameId: string;
  position: number;
  // Fourni par le conteur quand il choisit à la place du joueur dont c'est le tour
  playerId?: string;
}

const pickCard = async ({ gameId, position, playerId }: PickCardPayload) =>
  (
    await axiosInstance.post<PickCardResponse>(
      GAMES_ENDPOINTS.pick(gameId, position),
      playerId ? { player_id: playerId } : {}
    )
  ).data;

const getPickErrorMessage = (error: unknown) => {
  switch (getErrorCode(error)) {
    case 'CARD_NOT_AVAILABLE':
      return "Cette carte vient d'être prise, choisissez-en une autre";
    case 'NOT_YOUR_TURN':
      return "Ce n'est pas votre tour";
    default:
      return 'Impossible de prendre cette carte';
  }
};

// Choix d'une carte face cachée. Après la dernière carte, la partie passe en première nuit.
export const usePickCardMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pickCard,
    onError: (error, { gameId }) => {
      showError(getPickErrorMessage(error));
      if (ENV === 'DEV') console.error('Impossible de prendre la carte :', error);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.cards(gameId) });
    },
    // La partie et ses cartes ont changé (la dernière carte lance la première nuit)
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
