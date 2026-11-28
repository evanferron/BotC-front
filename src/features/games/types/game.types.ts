import type { ApiSchemas } from '@common/api/api.types';

// Phase de la partie. L'API sérialise l'enum Rust tel quel (PascalCase), pas en MAJUSCULES comme en base.
export type GameStatus = ApiSchemas['GameStatus'];

export type Alignment = ApiSchemas['Alignment'];

// Réponse de GET /games, GET /games/{id}, POST /games. `storyteller_online` n'est renseigné que
// par GET /games/{id}.
export type Game = ApiSchemas['GameResponse'];

// Vue publique d'un joueur : jamais de rôle ni d'alignement
export type Player = ApiSchemas['PlayerResponse'];

// Réponse de POST /games/join
export type JoinGameResponse = ApiSchemas['JoinGameResponse'];

// Corps de POST /games (nombre de joueurs prévu, hors conteur)
export type CreateGamePayload = ApiSchemas['CreateGameRequest'];

// ---------------------------------------------------------------------------
// Distribution
// ---------------------------------------------------------------------------

// Rôle tel qu'un joueur peut le voir
export type RoleSummary = ApiSchemas['RoleSummary'];

// Carte face cachée. role et shown_role ne sont envoyés qu'au conteur.
export type GameCardInfo = ApiSchemas['CardResponse'];

// Réponse de GET /games/{id}/cards
export type Distribution = ApiSchemas['DistributionResponse'];

// Réponse de POST /games/{id}/cards/{position}/pick
export type PickCardResponse = ApiSchemas['PickCardResponse'];
