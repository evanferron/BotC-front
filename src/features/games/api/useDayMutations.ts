import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { getErrorCode } from '@common/api/errors';
import { showError } from '@common/utils/toast.utils';
import type {
  EndDayPayload,
  EndDayResponse,
  NominatePayload,
  NominateResponse,
} from '../types/day.types';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

// Actions du jour. Toutes relisent la partie (phase, joueurs, jour) : la clé `details` les couvre.

interface NominationAction {
  gameId: string;
  nominationId: string;
}

const useDayMutation = <TPayload extends { gameId: string }, TResult>(
  action: (payload: TPayload) => Promise<TResult>,
  errorMessage: (error: unknown) => string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onError: (error) => {
      showError(errorMessage(error));
      if (ENV === 'DEV') console.error(errorMessage(error), error);
    },
    onSettled: (_data, _error, { gameId }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};

// Conteur : ouvrir ou fermer le conseil
export const useCouncilMutation = () =>
  useDayMutation(
    async ({ gameId, open }: { gameId: string; open: boolean }) => {
      await axiosInstance.post(GAMES_ENDPOINTS.council(gameId), { open });
    },
    () => 'Impossible de changer le conseil'
  );

// Conteur : enregistrer une nomination (la Vierge s'applique côté serveur)
export const useNominateMutation = () =>
  useDayMutation(
    async ({ gameId, nomineeId, nominatorId, suppressAbilities }: NominatePayload) =>
      (
        await axiosInstance.post<NominateResponse>(GAMES_ENDPOINTS.nominations(gameId), {
          nominee_id: nomineeId,
          nominator_id: nominatorId,
          suppress_abilities: suppressAbilities,
        })
      ).data,
    (error) =>
      getErrorCode(error) === 'NOMINATION_NOT_ALLOWED'
        ? "Nomination impossible : chacun ne nomme et n'est nommé qu'une fois par jour"
        : 'Impossible d’enregistrer la nomination'
  );

// Conteur : annuler une nomination (mauvais clic)
export const useCancelNominationMutation = () =>
  useDayMutation(
    async ({ gameId, nominationId }: NominationAction) => {
      await axiosInstance.delete(GAMES_ENDPOINTS.nomination(gameId, nominationId));
    },
    () => 'Impossible d’annuler la nomination'
  );

// Conteur : ouvrir le vote
export const useOpenVoteMutation = () =>
  useDayMutation(
    async ({ gameId, nominationId }: NominationAction) => {
      await axiosInstance.post(GAMES_ENDPOINTS.openVote(gameId, nominationId));
    },
    () => 'Impossible d’ouvrir le vote'
  );

// Conteur : clore le vote sans attendre les derniers (ils comptent contre)
export const useCloseVoteMutation = () =>
  useDayMutation(
    async ({ gameId, nominationId }: NominationAction) => {
      await axiosInstance.post(GAMES_ENDPOINTS.closeVote(gameId, nominationId));
    },
    () => 'Impossible de clore le vote'
  );

// Joueur : voter, définitivement
export const useVoteMutation = () =>
  useDayMutation(
    async ({ gameId, nominationId, isYes }: NominationAction & { isYes: boolean }) => {
      await axiosInstance.post(GAMES_ENDPOINTS.vote(gameId, nominationId), { is_yes: isYes });
    },
    (error) => {
      switch (getErrorCode(error)) {
        case 'ALREADY_VOTED':
          return 'Vous avez déjà voté';
        case 'CANNOT_VOTE':
          return 'Votre voix fantôme est déjà utilisée';
        case 'INVALID_NOMINATION_STATE':
          return 'Le vote est clos';
        default:
          return 'Impossible d’enregistrer votre vote';
      }
    }
  );

// Conteur : finir le jour (exécution, Maire, puis nuit)
export const useEndDayMutation = () =>
  useDayMutation(
    async ({ gameId, execute, suppressAbilities }: EndDayPayload) =>
      (
        await axiosInstance.post<EndDayResponse>(GAMES_ENDPOINTS.endDay(gameId), {
          execute,
          suppress_abilities: suppressAbilities,
        })
      ).data,
    () => 'Impossible de terminer le jour'
  );
