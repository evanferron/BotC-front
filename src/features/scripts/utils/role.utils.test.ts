import { describe, expect, it } from 'vitest';
import type { ScriptRole } from '../types/script.types';
import { getGroupLabel, getTypeTeam, groupByType, matchesSearch } from './role.utils';

const role = (id: string, name: string, character_type: ScriptRole['character_type']) =>
  ({
    id,
    name,
    character_type,
    default_alignment: getTypeTeam(character_type),
  }) satisfies ScriptRole;

describe('role.utils', () => {
  it('accorde les libellés de groupe', () => {
    expect(getGroupLabel('Outsider', 1)).toBe('Étranger');
    expect(getGroupLabel('Outsider', 2)).toBe('Étrangers');
    expect(getGroupLabel('Townsfolk', 2)).toBe('Villageois');
  });

  it('place les Sbires et le Démon dans la mauvaise équipe', () => {
    expect(getTypeTeam('Minion')).toBe('Evil');
    expect(getTypeTeam('Demon')).toBe('Evil');
    expect(getTypeTeam('Outsider')).toBe('Good');
  });

  it('cherche sans tenir compte des accents ni de la casse', () => {
    const squire = role('squire', 'Écuyer', 'Townsfolk');
    expect(matchesSearch(squire, 'ecuyer')).toBe(true);
    expect(matchesSearch(squire, '  ÉCU ')).toBe(true);
    expect(matchesSearch(squire, '')).toBe(true);
    expect(matchesSearch(squire, 'moine')).toBe(false);
  });

  it('regroupe par type dans l’ordre du script, trie par nom, retire les groupes vides', () => {
    const groups = groupByType([
      role('imp', 'Diable', 'Demon'),
      role('monk', 'Moine', 'Townsfolk'),
      role('chef', 'Cuisinier', 'Townsfolk'),
    ]);
    expect(groups.map((g) => g.type)).toEqual(['Townsfolk', 'Demon']);
    expect(groups[0]?.roles.map((r) => r.name)).toEqual(['Cuisinier', 'Moine']);
  });
});
