import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';

// Code HTTP d'une erreur d'appel API, ou undefined (réseau coupé, erreur JS)
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

// Message technique renvoyé par l'API (en anglais), ou undefined
export const getApiErrorMessage = (error: unknown): string | undefined =>
  axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data?.message : undefined;

// Vrai si le serveur n'a pas répondu (hors ligne, API arrêtée)
export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;
