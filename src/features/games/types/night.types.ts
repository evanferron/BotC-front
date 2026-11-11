import type { RoleSummary } from './game.types';

// Gabarit d'action d'une étape (ActionKind côté API)
export type ActionKind = 'None' | 'ChooseOnePlayer' | 'ChooseTwoPlayers' | 'ChooseRole' | 'Confirm';

// Avancement d'une étape (ActionStatus côté API)
export type ActionStatus =
  'Pending' | 'WaitingPlayer' | 'Received' | 'Accepted' | 'Modified' | 'Ignored' | 'Skipped';

// Joueur réveillé par une étape
export interface StepActor {
  id: string;
  pseudo: string;
  is_alive: boolean;
  // Le joueur croit avoir ce rôle sans l'avoir (l'Ivrogne)
  believes_role: boolean;
}

// Étape de nuit, vue par le conteur
export interface NightStep {
  id: string;
  step_order: number;
  // Rôle de l'étape, ou minion_info, demon_info, custom
  action_type: string;
  action_kind: ActionKind;
  status: ActionStatus;
  role: RoleSummary | null;
  reminder: string | null;
  actor: StepActor | null;
  target_id: string | null;
  second_target_id: string | null;
  target_role_id: string | null;
  storyteller_note: string | null;
}

// Réponse de GET /games/{id}/night
export interface Night {
  round: number;
  is_first_night: boolean;
  steps: NightStep[];
  demon_bluffs: RoleSummary[];
}

// Choix d'un joueur, selon le gabarit
export interface StepChoice {
  target_id?: string;
  second_target_id?: string;
  target_role_id?: string;
}

export type StepDecision = 'Accepted' | 'Modified' | 'Ignored';

// Réponse de GET /games/{id}/night/prompt : même forme pour tous les joueurs
export interface NightPrompt {
  prompt: { step_id: string; action_kind: ActionKind } | null;
}

export type MessageKind = 'Text' | 'Players' | 'Roles' | 'Number' | 'YesNo' | 'TeamInfo';

// Données d'un message selon son type
export interface MessagePayload {
  player_ids?: string[];
  role_ids?: string[];
  number?: number;
  answer?: boolean;
  // TeamInfo
  demon_ids?: string[];
  minion_ids?: string[];
  bluff_role_ids?: string[];
}

// Message du conteur, vu par son destinataire
export interface PlayerMessage {
  id: string;
  round_number: number;
  kind: MessageKind;
  content: string | null;
  payload: MessagePayload;
  created_at: string;
  read_at: string | null;
}

// Corps de POST /games/{id}/players/{player_id}/messages
export interface SendMessagePayload {
  kind: Exclude<MessageKind, 'TeamInfo'>;
  content?: string;
  player_ids?: string[];
  role_ids?: string[];
  number?: number;
  answer?: boolean;
  night_action_id?: string;
}
