import { describe, expect, it } from 'vitest';
import {
  cannotChooseSelf,
  getChoiceShape,
  isChoiceComplete,
  isOpenStatus,
  toStepChoice,
  toggleSelection,
} from './night.utils';

describe('toggleSelection', () => {
  it('remplace la sélection quand un seul choix est permis', () => {
    expect(toggleSelection(['a'], 'b', 1)).toEqual(['b']);
  });

  it('ajoute jusqu’au maximum, puis ignore', () => {
    expect(toggleSelection(['a'], 'b', 2)).toEqual(['a', 'b']);
    expect(toggleSelection(['a', 'b'], 'c', 2)).toEqual(['a', 'b']);
  });

  it('retire un élément déjà choisi', () => {
    expect(toggleSelection(['a', 'b'], 'a', 2)).toEqual(['b']);
    expect(toggleSelection(['a'], 'a', 1)).toEqual([]);
  });
});

describe('forme d’un choix', () => {
  it('compte les joueurs et rôles attendus par gabarit', () => {
    expect(getChoiceShape('ChooseOnePlayer')).toEqual({ players: 1, roles: 0 });
    expect(getChoiceShape('ChooseTwoPlayers')).toEqual({ players: 2, roles: 0 });
    expect(getChoiceShape('ChooseRole')).toEqual({ players: 0, roles: 1 });
    expect(getChoiceShape('Confirm')).toEqual({ players: 0, roles: 0 });
  });

  it('n’est complet qu’avec exactement le bon nombre', () => {
    expect(isChoiceComplete('ChooseTwoPlayers', ['a'], [])).toBe(false);
    expect(isChoiceComplete('ChooseTwoPlayers', ['a', 'b'], [])).toBe(true);
    expect(isChoiceComplete('ChooseRole', [], ['imp'])).toBe(true);
    expect(isChoiceComplete('Confirm', [], [])).toBe(true);
  });

  it('se traduit en corps de requête', () => {
    expect(toStepChoice(['a', 'b'], [])).toEqual({
      target_id: 'a',
      second_target_id: 'b',
      target_role_id: undefined,
    });
    expect(toStepChoice([], ['imp']).target_role_id).toBe('imp');
  });
});

describe('cannotChooseSelf', () => {
  it('interdit au Moine de se choisir, pas aux autres rôles', () => {
    expect(cannotChooseSelf('monk')).toBe(true);
    expect(cannotChooseSelf('poisoner')).toBe(false);
    expect(cannotChooseSelf(undefined)).toBe(false);
    expect(cannotChooseSelf(null)).toBe(false);
  });
});

describe('isOpenStatus', () => {
  it('ne garde que les étapes encore à traiter', () => {
    expect(isOpenStatus('Pending')).toBe(true);
    expect(isOpenStatus('WaitingPlayer')).toBe(true);
    expect(isOpenStatus('Received')).toBe(true);
    expect(isOpenStatus('Accepted')).toBe(false);
    expect(isOpenStatus('Skipped')).toBe(false);
  });
});
