import type { Alignment, RoleSummary } from './game.types';

// Joueur révélé à la fin (RevealedPlayer côté API) : tout est public
export interface RevealedPlayer {
  id: string;
  pseudo: string;
  seat_position: number | null;
  is_alive: boolean;
  role: RoleSummary | null;
  // Rôle que le joueur croyait avoir, s'il différait (l'Ivrogne)
  shown_role: RoleSummary | null;
  alignment: Alignment | null;
}

// Réponse de GET /games/{id}/summary : seulement une fois la partie terminée
export interface GameSummary {
  winner: Alignment | null;
  reason: string | null;
  rounds: number;
  players: RevealedPlayer[];
}

export interface EndGamePayload {
  gameId: string;
  winner: Alignment;
  reason: string | null;
}
