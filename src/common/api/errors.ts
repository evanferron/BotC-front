import axios from 'axios';

/**
 * Codes d'erreur stables de l'API (`error_codes!` dans BotC-back/src/common/error.rs).
 * Le front teste le code, jamais le message : à tenir aligné avec le back.
 */
export type ErrorCode =
  // Requête invalide
  | 'BAD_REQUEST'
  | 'MALFORMED_JSON'
  | 'INVALID_PATH_PARAM'
  | 'INVALID_QUERY'
  | 'VALIDATION_FAILED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  // Authentification / autorisation
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  // Ressources
  | 'NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  // Limites / disponibilité
  | 'RATE_LIMITED'
  | 'REQUEST_TIMEOUT'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL'
  // Métier : users
  | 'USER_NOT_FOUND'
  | 'PSEUDO_ALREADY_USED'
  | 'INVALID_CURRENT_PASSWORD'
  // Métier : scripts
  | 'SCRIPT_NOT_FOUND'
  // Métier : parties
  | 'GAME_NOT_FOUND'
  | 'ROOM_CODE_NOT_FOUND'
  | 'PLAYER_NOT_FOUND'
  | 'GAME_ALREADY_STARTED'
  | 'GAME_FULL'
  | 'TABLE_INCOMPLETE'
  | 'WRONG_PHASE'
  | 'NOT_YOUR_TURN'
  | 'CARD_NOT_AVAILABLE'
  | 'INVALID_COMPOSITION'
  // Métier : nuit
  | 'NIGHT_STEP_NOT_FOUND'
  | 'INVALID_STEP_STATE'
  | 'MESSAGE_NOT_FOUND'
  // Métier : jour
  | 'NOMINATION_NOT_FOUND'
  | 'NOMINATION_NOT_ALLOWED'
  | 'INVALID_NOMINATION_STATE'
  | 'ALREADY_VOTED'
  | 'CANNOT_VOTE';

// Corps d'erreur de l'API, au format RFC 9457 (ErrorResponse côté Rust)
export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  // Message lisible, en anglais : à ne pas afficher ni tester
  detail: string;
  // Erreurs par champ (VALIDATION_FAILED uniquement)
  errors?: Record<string, string[]>;
  request_id?: string;
}

// Code HTTP d'une erreur d'appel API, ou undefined (réseau coupé, erreur JS)
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

// Code d'erreur stable de l'API, ou undefined (réseau coupé, réponse sans corps)
export const getErrorCode = (error: unknown): ErrorCode | undefined =>
  axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.code : undefined;

// Vrai si le serveur n'a pas répondu (hors ligne, API arrêtée)
export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;
