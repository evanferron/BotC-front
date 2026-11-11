import type { CharacterType } from '../types/game.types';

// Les Sbires et le Démon sont dans la mauvaise équipe
export const isEvilType = (type: CharacterType) => type === 'Minion' || type === 'Demon';

export const getCharacterTypeLabel = (type: CharacterType): string => {
  const labels: Record<CharacterType, string> = {
    Townsfolk: 'Habitant',
    Outsider: 'Étranger',
    Minion: 'Sbire',
    Demon: 'Démon',
  };
  return labels[type];
};
