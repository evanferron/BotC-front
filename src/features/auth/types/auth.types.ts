import type { ApiSchemas } from '@common/api/api.types';

// Réponse de POST /auth/login et POST /auth/refresh
export type TokenResponse = ApiSchemas['TokenResponse'];

export type Credentials = ApiSchemas['LoginRequest'];

// Session courante : l'identité vient du `sub` de l'access token
export interface Session {
  userId: string;
}

// Réponse de GET /users/{id}
export type User = ApiSchemas['UserResponse'];
