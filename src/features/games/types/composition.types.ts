import type { CharacterType } from '@scripts/types/script.types';

// Carte d'une composition : rôle réel et rôle que le joueur croira avoir (l'Ivrogne)
export interface CompositionCard {
  role_id: string;
  // Absent pour l'Ivrogne : le serveur tire un Villageois absent de la partie
  shown_role_id?: string | null;
}

// Nombre de rôles de chaque type
export type CompositionBreakdown = Record<CharacterType, number>;

// Répartition conseillée côté API (sans l'effet du Baron)
export interface RecommendedBreakdown {
  townsfolk: number;
  outsiders: number;
  minions: number;
  demons: number;
}

export interface Composition {
  // Vrai si aucune composition n'est choisie : elle sera tirée au lancement
  random: boolean;
  cards: CompositionCard[];
  recommended: RecommendedBreakdown | null;
}

// Composition conseillée, construite pour le nombre de joueurs de la partie
export interface CompositionSuggestion {
  id: string;
  name: string;
  description: string;
  cards: CompositionCard[];
}
