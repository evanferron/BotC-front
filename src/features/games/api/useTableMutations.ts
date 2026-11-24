import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError, showSuccess } from '@common/utils/toast.utils';
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
