import type { GameStatus } from './game.types';

// Statut d'une nomination (NominationStatus côté API)
export type NominationStatus = 'Nominated' | 'Voting' | 'Closed' | 'Cancelled';

// Vote public d'un joueur : à la table, les mains se lèvent
export interface DayVote {
  voter_id: string;
  is_yes: boolean;
  used_ghost_vote: boolean;
}

export interface Nomination {
  id: string;
  nominee_id: string;
  nominator_id: string | null;
  status: NominationStatus;
  // En direct pendant le vote, définitif à la clôture
  yes_count: number;
  no_count: number;
  votes: DayVote[];
  executed: boolean;
}

// Réponse de GET /games/{id}/day : identique pour tous les membres
export interface Day {
  round: number;
  status: GameStatus;
  alive_count: number;
  // Voix pour nécessaires pour monter sur l'échafaud
  threshold: number;
  // Vivants, et morts qui ont encore leur vote fantôme
  eligible_voter_ids: string[];
  nominations: Nomination[];
  // Joueur exécuté si le jour finissait maintenant
  on_the_block: string | null;
}

export interface NominatePayload {
  gameId: string;
  nomineeId: string;
  nominatorId: string;
  // Vierge empoisonnée : rien n'est appliqué automatiquement
  suppressAbilities: boolean;
}

export interface NominateResponse {
  nomination: Nomination;
  // Renseigné si la Vierge s'est déclenchée : le jour est fini
  virgin: { executed_player_id: string } | null;
  game_status: GameStatus;
}

export interface EndDayPayload {
  gameId: string;
  execute: boolean;
  // Maire empoisonné : pas de victoire automatique
  suppressAbilities: boolean;
}

export interface EndDayResponse {
  executed_player_id: string | null;
  game_status: GameStatus;
  winner: 'Good' | 'Evil' | null;
}
