import type { PhaseVariant } from '@/components/PhaseBar/PhaseBar';
import type { Game, GameStatus } from '../types/game.types';

// Libellé court de la phase, avec la manche quand elle a un sens (« Nuit 3 », « Jour 2 »)
export const getPhaseLabel = (game: Pick<Game, 'status' | 'current_round'>): string => {
  const round = game.current_round > 0 ? ` ${game.current_round}` : '';
  const labels: Record<GameStatus, string> = {
    Lobby: 'Lobby',
    Distribution: 'Distribution',
    FirstNight: 'Première nuit',
    Day: `Jour${round}`,
    Council: 'Conseil',
    Voting: 'Vote',
    Night: `Nuit${round}`,
    Ended: 'Terminée',
  };
  return labels[game.status];
};

// Ambiance du bandeau de phase
export const getPhaseVariant = (status: GameStatus): PhaseVariant => {
  switch (status) {
    case 'Lobby':
    case 'Distribution':
      return 'lobby';
    case 'Day':
    case 'Council':
      return 'day';
    case 'Voting':
      return 'vote';
    case 'Ended':
      return 'end';
    default:
      return 'night';
  }
};

export const isGameInProgress = (status: GameStatus) => status !== 'Lobby' && status !== 'Ended';

// Résumé sous le code (« Trouble Brewing · 10 joueurs »)
export const formatPlayerCount = (count: number) => `${count} joueur${count > 1 ? 's' : ''}`;

export const getWinnerLabel = (game: Pick<Game, 'winner'>): string | undefined => {
  if (game.winner === 'Good') return 'La bonne équipe a gagné';
  if (game.winner === 'Evil') return 'La mauvaise équipe a gagné';
  return undefined;
};
