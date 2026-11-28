// Journal de la partie et annulation de la dernière action du conteur.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorCode } from '@common/api/errors';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type { Journal } from '../types/journal.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINTS, GAMES_KEYS } from './GAMES_CONF';

const getJournal = async (gameId: string) =>
  (await axiosInstance.get<Journal>(GAMES_ENDPOINTS.journal(gameId))).data;

// Conteur : journal complet, relu en continu tant qu'il est ouvert
export const useJournalQuery = (gameId: string) =>
  useQuery({
    queryKey: GAMES_KEYS.journal(gameId),
    queryFn: () => getJournal(gameId),
    refetchInterval: (query) =>
      query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de lire le journal' },
  });

const undo = async (gameId: string) =>
  (await axiosInstance.post<{ label: string }>(GAMES_ENDPOINTS.undo(gameId))).data;

// Conteur : annuler sa dernière action (la partie revient à l'état d'avant)
export const useUndoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: undo,
    onError: (error) => {
      showError(
        getErrorCode(error) === 'NOTHING_TO_UNDO'
          ? 'Il n’y a plus rien à annuler'
          : 'Impossible d’annuler cette action'
      );
      if (ENV === 'DEV') console.error('Annulation impossible :', error);
    },
    // Tout peut avoir changé : phase, joueurs, nuit, jour, grimoire, journal
    onSuccess: (_data, gameId) =>
      queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) }),
  });
};
