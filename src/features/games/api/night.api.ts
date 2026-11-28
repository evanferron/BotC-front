// Nuit : étapes du conteur, demande et réponse du joueur.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type {
  Night,
  StepChoice,
  StepDecision,
  ActionKind,
  NightPrompt,
} from '../types/night.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getNight = async (gameId: string) =>
  (await axiosInstance.get<Night>(GAMES_ENDPOINTS.night(gameId))).data;

/**
 * Étapes de la nuit, réservé au conteur.
 * `polling` : relit la nuit pour voir arriver les choix des joueurs, en attendant le temps réel.
 */
export const useNightQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.night(gameId ?? ''),
    queryFn: () => getNight(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    meta: { errorMessage: 'Impossible de récupérer la nuit' },
  });

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

interface EndNightPayload {
  gameId: string;
  // Joueurs morts cette nuit
  deaths: string[];
}

const endNight = async ({ gameId, deaths }: EndNightPayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.nightEnd(gameId), { deaths });
};

// Conteur : lever le jour, en annonçant les morts de la nuit
export const useEndNightMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: endNight,
    onError: (error) => {
      showError('Impossible de lever le jour');
      if (ENV === 'DEV') console.error('Impossible de lever le jour :', error);
    },
    // La partie, les joueurs (morts) et la nuit changent
    onSuccess: (_data, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};

const getPrompt = async (gameId: string) =>
  (await axiosInstance.get<NightPrompt>(GAMES_ENDPOINTS.prompt(gameId))).data;

/**
 * Demande en cours du joueur (null le plus souvent). Tous les joueurs la relisent au même
 * rythme pendant la nuit : le trafic ne trahit pas qui est réveillé.
 */
export const usePromptQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.prompt(gameId ?? ''),
    queryFn: () => getPrompt(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
  });

interface RespondPayload {
  gameId: string;
  choice: StepChoice;
}

const respond = async ({ gameId, choice }: RespondPayload) => {
  await axiosInstance.post(GAMES_ENDPOINTS.respond(gameId), choice);
};

// Joueur : envoie son choix au conteur. Pas d'accusé visible : l'écran retombe sur l'attente.
export const useRespondMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respond,
    onError: (error) => {
      showError("Votre choix n'a pas pu être envoyé");
      if (ENV === 'DEV') console.error("Impossible d'envoyer le choix :", error);
    },
    onSettled: (_data, _error, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.prompt(gameId) }),
  });
};
