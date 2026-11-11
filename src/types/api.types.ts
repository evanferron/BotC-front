// Corps d'erreur renvoyé par l'API (ErrorResponse côté Rust)
export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
}
