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

// ---------------------------------------------------------------------------
// Distribution
// ---------------------------------------------------------------------------

export type CharacterType = 'Townsfolk' | 'Outsider' | 'Minion' | 'Demon';

// Rôle tel qu'un joueur peut le voir (RoleSummary côté API)
export interface RoleSummary {
  id: string;
  name: string;
  character_type: CharacterType;
  ability_description: string | null;
}

// Carte face cachée. role et shown_role ne sont envoyés qu'au conteur.
export interface GameCardInfo {
  position: number;
  // Joueur qui a pris la carte (null tant qu'elle est libre)
  picked_by: string | null;
  role?: RoleSummary;
  // Rôle vu par le joueur s'il diffère du rôle réel (ex. l'Ivrogne)
  shown_role?: RoleSummary;
}

// Réponse de GET /games/{id}/cards
export interface Distribution {
  cards: GameCardInfo[];
  // Joueur dont c'est le tour (null quand toutes les cartes sont prises)
  current_picker_id: string | null;
  // Rôle du joueur connecté tel qu'il le voit (null pour le conteur ou avant d'avoir pioché)
  my_role: RoleSummary | null;
}

// Réponse de POST /games/{id}/cards/{position}/pick
export interface PickCardResponse {
  position: number;
  player_id: string;
  role: RoleSummary;
  game_status: GameStatus;
}
