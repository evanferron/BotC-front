// Réponse de POST /auth/login et POST /auth/refresh
export interface TokenResponse {
  access_token: string;
  // Durée de vie de l'access token en secondes
  expires_in: number;
  token_type: string;
}

export interface Credentials {
  pseudo: string;
  password: string;
}

// Session courante : l'identité vient du `sub` de l'access token
export interface Session {
  userId: string;
}

// Réponse de GET /users/{id} (UserResponse côté API)
export interface User {
  id: string;
  pseudo: string;
  created_at: string;
  updated_at: string;
}
