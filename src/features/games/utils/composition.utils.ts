import { CHARACTER_TYPES, getGroupLabel } from '@scripts/utils/role.utils';
import type { RoleSummary } from '../types/game.types';
import type { CompositionBreakdown, RecommendedBreakdown } from '../types/composition.types';

// Rôle qui ajoute deux Étrangers à la place de deux Villageois
export const BARON_ROLE_ID = 'baron';
// Rôle qui se croit Villageois
export const DRUNK_ROLE_ID = 'drunk';

export const countByType = (roleIds: string[], roles: RoleSummary[]): CompositionBreakdown => {
  const counts: CompositionBreakdown = { Townsfolk: 0, Outsider: 0, Minion: 0, Demon: 0 };
  for (const id of roleIds) {
    const role = roles.find((r) => r.id === id);
    if (role) counts[role.character_type] += 1;
  }
  return counts;
};

// Répartition conseillée, ajustée par le Baron s'il est choisi
export const expectedBreakdown = (
  recommended: RecommendedBreakdown,
  roleIds: string[]
): CompositionBreakdown => {
  const shift = roleIds.includes(BARON_ROLE_ID) ? Math.min(2, recommended.townsfolk) : 0;
  return {
    Townsfolk: recommended.townsfolk - shift,
    Outsider: recommended.outsiders + shift,
    Minion: recommended.minions,
    Demon: recommended.demons,
  };
};

export type CompositionStatus = { ready: true } | { ready: false; message: string };

// Ce qui empêche de jouer : le serveur refuse les mêmes cas (INVALID_COMPOSITION)
export const getCompositionStatus = (
  roleIds: string[],
  roles: RoleSummary[],
  playerCount: number
): CompositionStatus => {
  const diff = roleIds.length - playerCount;
  if (diff < 0) {
    const n = -diff;
    return { ready: false, message: `Ajoutez ${n} rôle${n > 1 ? 's' : ''} pour continuer.` };
  }
  if (diff > 0) {
    return { ready: false, message: `Retirez ${diff} rôle${diff > 1 ? 's' : ''} pour continuer.` };
  }
  if (countByType(roleIds, roles).Demon === 0) {
    return { ready: false, message: 'Il faut au moins un Démon.' };
  }
  return { ready: true };
};

// Écarts à la répartition conseillée : un avertissement, pas un blocage
export const describeDeviation = (
  actual: CompositionBreakdown,
  expected: CompositionBreakdown
): string | undefined => {
  const gaps = CHARACTER_TYPES.filter((type) => actual[type] !== expected[type]).map(
    (type) => `${actual[type]} ${getGroupLabel(type, actual[type])} au lieu de ${expected[type]}`
  );
  return gaps.length > 0 ? `Répartition inhabituelle : ${gaps.join(', ')}.` : undefined;
};

// « 5 Villageois, 0 Étranger, 1 Sbire et 1 Démon »
export const describeBreakdown = (recommended: RecommendedBreakdown) => {
  const parts = [
    `${recommended.townsfolk} ${getGroupLabel('Townsfolk', recommended.townsfolk)}`,
    `${recommended.outsiders} ${getGroupLabel('Outsider', recommended.outsiders)}`,
    `${recommended.minions} ${getGroupLabel('Minion', recommended.minions)}`,
  ];
  return `${parts.join(', ')} et ${recommended.demons} ${getGroupLabel('Demon', recommended.demons)}`;
};
