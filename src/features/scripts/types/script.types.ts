// Type de personnage. L'API sérialise l'enum Rust tel quel (PascalCase).
export type CharacterType = 'Townsfolk' | 'Outsider' | 'Minion' | 'Demon';

export type Team = 'Good' | 'Evil';

// Réponse de GET /scripts (ScriptResponse côté API)
export interface ScriptSummary {
  id: string;
  name: string;
  description: string | null;
}

// Rôle public d'un script (ScriptRoleResponse) : ni ordre de nuit, ni consignes au conteur
export interface ScriptRole {
  id: string;
  name: string;
  character_type: CharacterType;
  // Équipe de départ : un Étranger est dans la bonne équipe
  default_alignment: Team;
  ability_description: string | null;
}

// Réponse de GET /scripts/{id} (ScriptDetailResponse)
export interface ScriptDetail extends ScriptSummary {
  roles: ScriptRole[];
}

// Rôle épinglé en haut de la liste : le rôle du joueur, sans son équipe réelle
export interface PinnedRole {
  id: string;
  name: string;
  character_type: CharacterType;
}

// Variante conteur : rôle en jeu et pseudos des joueurs qui l'ont (vide si la carte est libre)
export type RolesInPlay = Map<string, string[]>;
