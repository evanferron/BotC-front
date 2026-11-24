import type { ApiSchemas } from '@common/api/api.types';
import type { Alignment } from './game.types';

// Joueur révélé à la fin : tout est public (`shown_role` : rôle qu'il croyait avoir, l'Ivrogne)
export type RevealedPlayer = ApiSchemas['RevealedPlayer'];

// Réponse de GET /games/{id}/summary : seulement une fois la partie terminée
export type GameSummary = ApiSchemas['SummaryResponse'];

export interface EndGamePayload {
  gameId: string;
  winner: Alignment;
  reason: string | null;
}
