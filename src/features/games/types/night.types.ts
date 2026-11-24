import type { ApiSchemas } from '@common/api/api.types';

// Gabarit d'action d'une étape
export type ActionKind = ApiSchemas['ActionKind'];

// Avancement d'une étape
export type ActionStatus = ApiSchemas['ActionStatus'];

// Joueur réveillé par une étape (`believes_role` : il croit avoir ce rôle sans l'avoir, l'Ivrogne)
export type StepActor = ApiSchemas['StepActor'];

// Étape de nuit, vue par le conteur (`action_type` : rôle de l'étape, ou minion_info, demon_info, custom)
export type NightStep = ApiSchemas['NightStepResponse'];

// Réponse de GET /games/{id}/night
export type Night = ApiSchemas['NightResponse'];

// Choix d'un joueur, selon le gabarit
export type StepChoice = ApiSchemas['StepChoice'];

export type StepDecision = ApiSchemas['StepDecision'];

// Réponse de GET /games/{id}/night/prompt : même forme pour tous les joueurs
export type NightPrompt = ApiSchemas['NightPromptResponse'];

export type MessageKind = ApiSchemas['MessageKind'];

// Données d'un message selon son type. Le back les stocke en JSON libre (`serde_json::Value`) :
// le schéma ne les décrit pas, d'où ce type écrit à la main.
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
export type PlayerMessage = Omit<ApiSchemas['MessageResponse'], 'payload'> & {
  payload: MessagePayload;
};

// Corps de POST /games/{id}/players/{player_id}/messages (TeamInfo est réservé à l'app)
export type SendMessagePayload = Omit<ApiSchemas['SendMessageRequest'], 'kind'> & {
  kind: Exclude<MessageKind, 'TeamInfo'>;
};
