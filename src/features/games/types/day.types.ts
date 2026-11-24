import type { ApiSchemas } from '@common/api/api.types';

// Statut d'une nomination
export type NominationStatus = ApiSchemas['NominationStatus'];

// Vote public d'un joueur : à la table, les mains se lèvent
export type DayVote = ApiSchemas['VoteResponse'];

// Nomination du jour (`yes_count` en direct pendant le vote, définitif à la clôture)
export type Nomination = ApiSchemas['NominationResponse'];

// Réponse de GET /games/{id}/day : identique pour tous les membres
export type Day = ApiSchemas['DayResponse'];

export interface NominatePayload {
  gameId: string;
  nomineeId: string;
  nominatorId: string;
  // Vierge empoisonnée : rien n'est appliqué automatiquement
  suppressAbilities: boolean;
}

export type NominateResponse = ApiSchemas['NominateResponse'];

export interface EndDayPayload {
  gameId: string;
  execute: boolean;
  // Maire empoisonné : pas de victoire automatique
  suppressAbilities: boolean;
}

export type EndDayResponse = ApiSchemas['EndDayResponse'];

// Tir du Pourfendeur annoncé à voix haute, saisi par le conteur
export interface SlayPayload {
  gameId: string;
  shooterId: string;
  targetId: string;
}

export type SlayResponse = ApiSchemas['SlayResponse'];
