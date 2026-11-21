import { Compass, Flame, Moon, Shield, Skull, TriangleAlert } from 'lucide-react';
import type { CharacterType, Team } from '../types/script.types';

// Icône par type de personnage, en attendant les icônes propres à chaque rôle
// (design/Roles-Icones.dc.html). Mêmes icônes que la carte de rôle.
export const TYPE_ICONS: Record<CharacterType, typeof Shield> = {
  Townsfolk: Shield,
  Outsider: Compass,
  Minion: Skull,
  Demon: Flame,
};

// Icône d'équipe : lune pour la bonne, pointe pour la mauvaise (design/Navigation-Vibrations)
export const TEAM_ICONS: Record<Team, typeof Moon> = {
  Good: Moon,
  Evil: TriangleAlert,
};
