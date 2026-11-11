// Phase de la partie. L'API sérialise l'enum Rust tel quel (PascalCase), pas en MAJUSCULES comme en base.
export type GameStatus =
  'Lobby' | 'Distribution' | 'FirstNight' | 'Day' | 'Council' | 'Voting' | 'Night' | 'Ended';

export type Alignment = 'Good' | 'Evil';

// Réponse de GET /games, GET /games/{id}, POST /games (GameResponse côté API)
export interface Game {
  id: string;
  room_code: string;
  storyteller_id: string;
  script_id: string;
  status: GameStatus;
  player_count: number;
  current_round: number;
  winner: Alignment | null;
  created_at: string;
  updated_at: string;
}

// Vue publique d'un joueur (PlayerResponse côté API) : jamais de rôle ni d'alignement
export interface Player {
  id: string;
  user_id: string;
  pseudo: string;
  seat_position: number | null;
  is_alive: boolean;
  has_ghost_vote: boolean;
  joined_at: string;
}

// Réponse de POST /games/join
export interface JoinGameResponse {
  game: Game;
  player_id: string;
}

export interface CreateGamePayload {
  script_id: string;
  // Nombre de joueurs prévu, hors conteur
  player_count: number;
}
