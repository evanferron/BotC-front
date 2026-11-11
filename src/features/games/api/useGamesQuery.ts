import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/config/axios.config';
import { DEFAULT_QUERY_GC_TIME, DEFAULT_QUERY_STALE_TIME } from '@/constants/QUERY';
import type { Game } from '../types/game.types';
import { GAMES_ENDPOINT, GAMES_KEYS } from './GAMES_CONF';

// Parties créées par l'utilisateur (en tant que conteur), les plus récentes d'abord
const getGames = async () =>
  (await axiosInstance.get<Game[]>(GAMES_ENDPOINT, { params: { per_page: 50 } })).data;

export const useGamesQuery = () =>
  useQuery({
    queryKey: GAMES_KEYS.list(),
    queryFn: getGames,
    staleTime: DEFAULT_QUERY_STALE_TIME,
    gcTime: DEFAULT_QUERY_GC_TIME,
    meta: { errorMessage: 'Impossible de récupérer vos parties' },
  });
