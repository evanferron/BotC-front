import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@/config/api.config';
import { axiosInstance } from '@/config/axios.config';
import { showError } from '@/services/toast.service';
import type { StepChoice, StepDecision } from '../types/night.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

type NightStepPayload =
  | { gameId: string; stepId: string; action: 'activate' | 'skip' }
  | {
      gameId: string;
      stepId: string;
      action: 'resolve';
      decision: StepDecision;
      choice?: StepChoice;
      note?: string;
    };

const runStepAction = async (payload: NightStepPayload) => {
  const url = GAMES_ENDPOINTS.nightStep(payload.gameId, payload.stepId, payload.action);
  const body =
    payload.action === 'resolve'
      ? { decision: payload.decision, choice: payload.choice, note: payload.note }
      : undefined;
  await axiosInstance.post(url, body);
};

const ERROR_MESSAGES: Record<NightStepPayload['action'], string> = {
  activate: 'Impossible de réveiller ce joueur',
  skip: "Impossible de passer l'étape",
  resolve: "Impossible d'appliquer la décision",
};

// Conteur : réveiller, passer ou résoudre une étape de nuit
export const useNightStepMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runStepAction,
    onError: (error, payload) => {
      showError(ERROR_MESSAGES[payload.action]);
      if (ENV === 'DEV') console.error(ERROR_MESSAGES[payload.action], error);
    },
    onSettled: (_data, _error, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.night(gameId) }),
  });
};
