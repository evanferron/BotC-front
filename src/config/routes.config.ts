// Routes publiques (redirigent vers les parties si l'utilisateur est connecté)
export const PUBLIC_ROUTES = {
  LOGIN: '/connexion',
  REGISTER: '/inscription',
} as const;

// Routes protégées (sous AuthLayout)
export const AUTH_ROUTES = {
  GAMES: '/parties',
  NEW_GAME: '/parties/nouvelle',
  GAME: '/parties/:gameId',
  JOIN: '/rejoindre',
} as const;

export const buildGameRoute = (gameId: string) => AUTH_ROUTES.GAME.replace(':gameId', gameId);

// Lien complet à partager pour rejoindre une table (le code est pré-rempli)
export const buildJoinUrl = (roomCode: string) =>
  `${window.location.origin}${AUTH_ROUTES.JOIN}?code=${encodeURIComponent(roomCode)}`;

// Routes par défaut
export const DEFAULT_ROUTES = {
  NOT_FOUND: '*',
} as const;
