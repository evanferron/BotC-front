import { useMutation } from '@tanstack/react-query';
import { ENV } from '@common/config/api.config';
import { axiosInstance } from '@common/api/http';
import { showError } from '@common/utils/toast.utils';
import type { CompositionCard } from '../types/composition.types';
import { GAMES_ENDPOINTS } from './GAMES_CONF';

const drawComposition = async (gameId: string) =>
  (await axiosInstance.post<{ cards: CompositionCard[] }>(GAMES_ENDPOINTS.compositionDraw(gameId)))
    .data.cards;

// Conteur : tirage au hasard à retoucher ; rien n'est enregistré côté serveur
export const useDrawCompositionMutation = () =>
  useMutation({
    mutationFn: drawComposition,
    onError: (error) => {
      showError('Impossible de tirer une composition');
      if (ENV === 'DEV') console.error('Tirage impossible :', error);
    },
  });
