import { describe, expect, it } from 'vitest';
import { formatPlayerCount, getPhaseLabel, getPhaseVariant, getWinnerLabel } from './game.utils';

describe('game.utils', () => {
  it('nomme la phase avec la manche quand elle a un sens', () => {
    expect(getPhaseLabel({ status: 'Night', current_round: 3 })).toBe('Nuit 3');
    expect(getPhaseLabel({ status: 'Day', current_round: 2 })).toBe('Jour 2');
    expect(getPhaseLabel({ status: 'FirstNight', current_round: 1 })).toBe('Première nuit');
    expect(getPhaseLabel({ status: 'Lobby', current_round: 0 })).toBe('Lobby');
  });

  it('associe chaque phase à son ambiance', () => {
    expect(getPhaseVariant('Distribution')).toBe('lobby');
    expect(getPhaseVariant('Council')).toBe('day');
    expect(getPhaseVariant('Voting')).toBe('vote');
    expect(getPhaseVariant('FirstNight')).toBe('night');
    expect(getPhaseVariant('Ended')).toBe('end');
  });

  it('accorde le nombre de joueurs', () => {
    expect(formatPlayerCount(1)).toBe('1 joueur');
    expect(formatPlayerCount(10)).toBe('10 joueurs');
  });

  it('annonce le camp vainqueur', () => {
    expect(getWinnerLabel({ winner: 'Good' })).toBe('La bonne équipe a gagné');
    expect(getWinnerLabel({ winner: 'Evil' })).toBe('La mauvaise équipe a gagné');
    expect(getWinnerLabel({ winner: null })).toBeUndefined();
  });
});
