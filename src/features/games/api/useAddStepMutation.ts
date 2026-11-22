import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import type { ActionKind } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

interface AddStepPayload {
  gameId: string;
  actorId: string;
  // Rôle au titre duquel le joueur est réveillé (facultatif)
  roleId: string | null;
  actionKind: ActionKind;
}

const addStep = async ({ gameId, actorId, roleId, actionKind }: AddStepPayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.nightSteps(gameId), {
    actor_id: actorId,
    role_id: roleId,
    action_kind: actionKind,
  });
};

// Conteur : ajouter une étape à la fin de la nuit en cours (cas imprévu, second réveil)
export const useAddStepMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStep,
    onError: (error) => {
      showError("Impossible d'ajouter l'étape");
      if (ENV === 'DEV') console.error("Impossible d'ajouter l'étape :", error);
    },
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.night(gameId) }),
  });
};
