import type { Alignment, RoleSummary } from './game.types';

// Joueur vu par le conteur (GrimoirePlayerResponse côté API) : tout, y compris le secret
export interface GrimoirePlayer {
  id: string;
  user_id: string;
  pseudo: string;
  seat_position: number | null;
  is_alive: boolean;
  has_ghost_vote: boolean;
  // Rôle réel
  role: RoleSummary | null;
  // Rôle que le joueur croit avoir, s'il diffère (l'Ivrogne)
  shown_role: RoleSummary | null;
  // Rôle sous lequel les capacités le perçoivent (l'Espion, le Reclus)
  registered_role: RoleSummary | null;
  alignment: Alignment | null;
  note: string | null;
}

// Correction : seuls les champs présents changent ; null efface les champs facultatifs
export interface PlayerStateCorrection {
  is_alive?: boolean;
  has_ghost_vote?: boolean;
  role_id?: string;
  shown_role_id?: string | null;
  registered_role_id?: string | null;
  alignment?: Alignment;
  note?: string | null;
}
