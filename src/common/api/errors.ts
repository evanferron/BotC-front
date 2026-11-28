import axios from 'axios';
import type { ApiSchemas } from './api.types';

// Codes d'erreur stables de l'API (`error_codes!` dans BotC-back/src/common/error.rs). Le front
// teste le code, jamais le message.
export type ErrorCode = ApiSchemas['ErrorCode'];

// Corps d'erreur de l'API, au format RFC 9457. `detail` est en anglais : à ne pas afficher ni tester.
export type ApiErrorResponse = ApiSchemas['ErrorResponse'];

// Code HTTP d'une erreur d'appel API, ou undefined (réseau coupé, erreur JS)
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

// Code d'erreur stable de l'API, ou undefined (réseau coupé, réponse sans corps)
export const getErrorCode = (error: unknown): ErrorCode | undefined =>
  axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.code : undefined;

// Vrai si le serveur n'a pas répondu (hors ligne, API arrêtée)
export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;
