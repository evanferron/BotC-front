import type { ApiSchemas } from '@common/api/api.types';

// Type de personnage
export type CharacterType = ApiSchemas['CharacterType'];

export type Team = ApiSchemas['Alignment'];

// Réponse de GET /scripts
export type ScriptSummary = ApiSchemas['ScriptResponse'];

// Rôle public d'un script : ni ordre de nuit, ni consignes au conteur
export type ScriptRole = ApiSchemas['ScriptRoleResponse'];

// Réponse de GET /scripts/{id}
export type ScriptDetail = ApiSchemas['ScriptDetailResponse'];

// Rôle épinglé en haut de la liste : le rôle du joueur, sans son équipe réelle
export interface PinnedRole {
  id: string;
  name: string;
  character_type: CharacterType;
}

// Variante conteur : rôle en jeu et pseudos des joueurs qui l'ont (vide si la carte est libre)
export type RolesInPlay = Map<string, string[]>;
