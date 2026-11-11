export const GAMES_ENDPOINT = '/games';

export const GAMES_ENDPOINTS = {
  join: `${GAMES_ENDPOINT}/join`,
  game: (id: string) => `${GAMES_ENDPOINT}/${id}`,
  players: (id: string) => `${GAMES_ENDPOINT}/${id}/players`,
  player: (id: string, playerId: string) => `${GAMES_ENDPOINT}/${id}/players/${playerId}`,
  leave: (id: string) => `${GAMES_ENDPOINT}/${id}/leave`,
  start: (id: string) => `${GAMES_ENDPOINT}/${id}/start`,
  cards: (id: string) => `${GAMES_ENDPOINT}/${id}/cards`,
  pick: (id: string, position: number) => `${GAMES_ENDPOINT}/${id}/cards/${position}/pick`,
  // Développement uniquement : route absente du serveur en production
  devFill: (id: string) => `${GAMES_ENDPOINT}/${id}/dev/fill`,
  roles: (id: string) => `${GAMES_ENDPOINT}/${id}/roles`,
  night: (id: string) => `${GAMES_ENDPOINT}/${id}/night`,
  nightStep: (id: string, stepId: string, action: 'activate' | 'resolve' | 'skip') =>
    `${GAMES_ENDPOINT}/${id}/night/steps/${stepId}/${action}`,
  nightEnd: (id: string) => `${GAMES_ENDPOINT}/${id}/night/end`,
  nightStart: (id: string) => `${GAMES_ENDPOINT}/${id}/night/start`,
  prompt: (id: string) => `${GAMES_ENDPOINT}/${id}/night/prompt`,
  respond: (id: string) => `${GAMES_ENDPOINT}/${id}/night/prompt/respond`,
  messages: (id: string) => `${GAMES_ENDPOINT}/${id}/messages`,
  readMessage: (id: string, messageId: string) =>
    `${GAMES_ENDPOINT}/${id}/messages/${messageId}/read`,
  sendMessage: (id: string, playerId: string) =>
    `${GAMES_ENDPOINT}/${id}/players/${playerId}/messages`,
} as const;

export const GAMES_KEYS = {
  all: ['games'] as const,
  lists: () => [...GAMES_KEYS.all, 'lists'] as const,
  list: () => [...GAMES_KEYS.lists()] as const,
  details: (id: string) => [...GAMES_KEYS.all, 'details', id] as const,
  players: (id: string) => [...GAMES_KEYS.details(id), 'players'] as const,
  cards: (id: string) => [...GAMES_KEYS.details(id), 'cards'] as const,
  roles: (id: string) => [...GAMES_KEYS.details(id), 'roles'] as const,
  night: (id: string) => [...GAMES_KEYS.details(id), 'night'] as const,
  prompt: (id: string) => [...GAMES_KEYS.details(id), 'prompt'] as const,
  messages: (id: string) => [...GAMES_KEYS.details(id), 'messages'] as const,
};
