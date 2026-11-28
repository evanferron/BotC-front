// Parties : liste, création, accès par code, partie courante et ses joueurs.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@common/api/http';
import { DEFAULT_QUERY_GC_TIME, DEFAULT_QUERY_STALE_TIME } from '@common/api/query';
import { ENV } from '@common/config/api.config';
import { showError } from '@common/utils/toast.utils';
import type {
  Game,
  GameStatus,
  CreateGamePayload,
  JoinGameResponse,
  Player,
} from '../types/game.types';
import { gamePollingInterval } from '../utils/realtime.utils';
import { GAMES_ENDPOINT, GAMES_KEYS, GAMES_ENDPOINTS } from './GAMES_CONF';

// Parties créées par l'utilisateur (en tant que conteur), les plus récentes d'abord
const getGames = async () =>
  (await axiosInstance.get<Game[]>(GAMES_ENDPOINT, { params: { per_page: 50 } })).data;

export const useGamesQuery = () =>
  useQuery({
    queryKey: GAMES_KEYS.lists(),
    queryFn: getGames,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de récupérer vos parties' },
  });

// Une partie finie ne change plus de phase : inutile de la relire
const isPolledStatus = (status: GameStatus | undefined) => !!status && status !== 'Ended';

const getGame = async (id: string) =>
  (await axiosInstance.get<Game>(GAMES_ENDPOINTS.game(id))).data;

/**
 * Partie courante, rechargée à chaque signal du temps réel (`useGameRealtime`). Si la connexion
 * temps réel est coupée et que la partie n'est pas finie, elle est relue régulièrement pour ne pas
 * manquer le changement de phase. Pas de toast d'erreur : la page affiche « partie introuvable ».
 */
export const useGameQuery = (id: string | undefined) =>
  useQuery({
    queryKey: GAMES_KEYS.details(id ?? ''),
    queryFn: () => getGame(id ?? ''),
    enabled: !!id,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      query.state.status !== 'error' && isPolledStatus(query.state.data?.status)
        ? gamePollingInterval(id)
        : false,
  });

const createGame = async (payload: CreateGamePayload) =>
  (await axiosInstance.post<Game>(GAMES_ENDPOINT, payload)).data;

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGame,
    onError: (error) => {
      showError('Impossible de créer la partie');
      if (ENV === 'DEV') console.error('Impossible de créer la partie :', error);
    },
    onSuccess: (game) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};

const joinGame = async (roomCode: string) =>
  (await axiosInstance.post<JoinGameResponse>(GAMES_ENDPOINTS.join, { room_code: roomCode })).data;

// Les erreurs (code inconnu, table pleine…) sont affichées par l'écran, sous le champ
export const useJoinGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGame,
    onError: (error) => {
      if (ENV === 'DEV') console.error('Impossible de rejoindre la partie :', error);
    },
    onSuccess: ({ game }) => {
      queryClient.setQueryData(GAMES_KEYS.details(game.id), game);
      return queryClient.invalidateQueries({ queryKey: GAMES_KEYS.lists() });
    },
  });
};

const getPlayers = async (gameId: string) =>
  (await axiosInstance.get<Player[]>(GAMES_ENDPOINTS.players(gameId))).data;

/**
 * Joueurs de la partie, dans l'ordre d'arrivée.
 * `polling` : relit la liste régulièrement (lobby), en attendant le temps réel.
 */
export const usePlayersQuery = (gameId: string | undefined, polling = false) =>
  useQuery({
    queryKey: GAMES_KEYS.players(gameId ?? ''),
    queryFn: () => getPlayers(gameId ?? ''),
    enabled: !!gameId,
    staleTime: 0,
    gcTime: DEFAULT_QUERY_GC_TIME,
    refetchInterval: (query) =>
      polling && query.state.status !== 'error' ? gamePollingInterval(gameId) : false,
    meta: { errorMessage: 'Impossible de récupérer les joueurs' },
  });
