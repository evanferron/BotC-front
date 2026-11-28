import { describe, expect, it } from 'vitest';
import type { RoleSummary } from '../types/game.types';
import {
  countByType,
  describeBreakdown,
  describeDeviation,
  expectedBreakdown,
  getCompositionStatus,
} from './composition.utils';

const role = (id: string, character_type: RoleSummary['character_type']): RoleSummary => ({
  id,
  name: id,
  character_type,
});

const roles = [
  role('washerwoman', 'Townsfolk'),
  role('chef', 'Townsfolk'),
  role('empath', 'Townsfolk'),
  role('drunk', 'Outsider'),
  role('saint', 'Outsider'),
  role('baron', 'Minion'),
  role('poisoner', 'Minion'),
  role('imp', 'Demon'),
];

const recommended = { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 };

describe('countByType', () => {
  it('compte les rôles connus par type et ignore les inconnus', () => {
    expect(countByType(['chef', 'imp', 'baron', 'inconnu'], roles)).toEqual({
      Townsfolk: 1,
      Outsider: 0,
      Minion: 1,
      Demon: 1,
    });
  });
});

describe('expectedBreakdown', () => {
  it('suit la répartition conseillée sans Baron', () => {
    expect(expectedBreakdown(recommended, ['poisoner'])).toEqual({
      Townsfolk: 3,
      Outsider: 0,
      Minion: 1,
      Demon: 1,
    });
  });

  it('remplace deux Villageois par deux Étrangers avec le Baron', () => {
    expect(expectedBreakdown(recommended, ['baron'])).toEqual({
      Townsfolk: 1,
      Outsider: 2,
      Minion: 1,
      Demon: 1,
    });
  });
});

describe('getCompositionStatus', () => {
  it('demande d’ajouter ou de retirer des rôles', () => {
    expect(getCompositionStatus(['imp'], roles, 3)).toEqual({
      ready: false,
      message: 'Ajoutez 2 rôles pour continuer.',
    });
    expect(getCompositionStatus(['imp', 'chef'], roles, 1)).toEqual({
      ready: false,
      message: 'Retirez 1 rôle pour continuer.',
    });
  });

  it('exige un Démon', () => {
    expect(getCompositionStatus(['chef', 'empath'], roles, 2)).toEqual({
      ready: false,
      message: 'Il faut au moins un Démon.',
    });
  });

  it('accepte une composition jouable', () => {
    expect(getCompositionStatus(['chef', 'imp'], roles, 2)).toEqual({ ready: true });
  });
});

describe('descriptions', () => {
  it('signale les écarts à la répartition conseillée', () => {
    const expected = expectedBreakdown(recommended, []);
    expect(describeDeviation(expected, expected)).toBeUndefined();
    expect(describeDeviation({ ...expected, Outsider: 1, Townsfolk: 2 }, expected)).toBe(
      'Répartition inhabituelle : 2 Villageois au lieu de 3, 1 Étranger au lieu de 0.'
    );
  });

  it('décrit la répartition conseillée', () => {
    expect(describeBreakdown(recommended)).toBe('3 Villageois, 0 Étranger, 1 Sbire et 1 Démon');
  });
});
