import type { ApiSchemas } from '@common/api/api.types';

// Statut posé par le conteur, invisible des joueurs
export type TokenKind = ApiSchemas['TokenKind'];

// Joueur vu par le conteur : tout, y compris le secret (rôle réel, rôle cru, rôle de façade)
export type GrimoirePlayer = ApiSchemas['GrimoirePlayerResponse'];

// Correction : seuls les champs présents changent ; null efface les champs facultatifs, `tokens`
// remplace la liste complète
export type PlayerStateCorrection = ApiSchemas['UpdatePlayerStateRequest'];
