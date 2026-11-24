import type { ApiSchemas } from '@common/api/api.types';
import type { CharacterType } from '@scripts/types/script.types';

// Carte d'une composition : rôle réel et rôle que le joueur croira avoir (l'Ivrogne ; absent, le
// serveur tire un Villageois absent de la partie)
export type CompositionCard = ApiSchemas['CompositionCard'];

// Nombre de rôles de chaque type, compté par le front
export type CompositionBreakdown = Record<CharacterType, number>;

// Répartition conseillée côté API (sans l'effet du Baron)
export type RecommendedBreakdown = ApiSchemas['CompositionBreakdown'];

// Composition du lobby (`random` : aucune n'est choisie, elle sera tirée au lancement)
export type Composition = ApiSchemas['CompositionResponse'];

// Composition conseillée, construite pour le nombre de joueurs de la partie
export type CompositionSuggestion = ApiSchemas['CompositionSuggestion'];
