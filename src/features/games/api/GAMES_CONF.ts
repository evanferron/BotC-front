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
  nightSteps: (id: string) => `${GAMES_ENDPOINT}/${id}/night/steps`,
  nightEnd: (id: string) => `${GAMES_ENDPOINT}/${id}/night/end`,
  prompt: (id: string) => `${GAMES_ENDPOINT}/${id}/night/prompt`,
  respond: (id: string) => `${GAMES_ENDPOINT}/${id}/night/prompt/respond`,
  messages: (id: string) => `${GAMES_ENDPOINT}/${id}/messages`,
  readMessage: (id: string, messageId: string) =>
    `${GAMES_ENDPOINT}/${id}/messages/${messageId}/read`,
  sendMessage: (id: string, playerId: string) =>
    `${GAMES_ENDPOINT}/${id}/players/${playerId}/messages`,
  day: (id: string) => `${GAMES_ENDPOINT}/${id}/day`,
  council: (id: string) => `${GAMES_ENDPOINT}/${id}/day/council`,
  endDay: (id: string) => `${GAMES_ENDPOINT}/${id}/day/end`,
  slay: (id: string) => `${GAMES_ENDPOINT}/${id}/day/slay`,
  nominations: (id: string) => `${GAMES_ENDPOINT}/${id}/nominations`,
  nomination: (id: string, nominationId: string) =>
    `${GAMES_ENDPOINT}/${id}/nominations/${nominationId}`,
  openVote: (id: string, nominationId: string) =>
    `${GAMES_ENDPOINT}/${id}/nominations/${nominationId}/open-vote`,
  vote: (id: string, nominationId: string) =>
    `${GAMES_ENDPOINT}/${id}/nominations/${nominationId}/vote`,
  closeVote: (id: string, nominationId: string) =>
    `${GAMES_ENDPOINT}/${id}/nominations/${nominationId}/close-vote`,
  grimoire: (id: string) => `${GAMES_ENDPOINT}/${id}/grimoire`,
  end: (id: string) => `${GAMES_ENDPOINT}/${id}/end`,
  summary: (id: string) => `${GAMES_ENDPOINT}/${id}/summary`,
  playerState: (id: string, playerId: string) =>
    `${GAMES_ENDPOINT}/${id}/players/${playerId}/state`,
  seats: (id: string) => `${GAMES_ENDPOINT}/${id}/seats`,
  composition: (id: string) => `${GAMES_ENDPOINT}/${id}/composition`,
  compositionSuggestions: (id: string) => `${GAMES_ENDPOINT}/${id}/composition/suggestions`,
  compositionDraw: (id: string) => `${GAMES_ENDPOINT}/${id}/composition/draw`,
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
  day: (id: string) => [...GAMES_KEYS.details(id), 'day'] as const,
  grimoire: (id: string) => [...GAMES_KEYS.details(id), 'grimoire'] as const,
  summary: (id: string) => [...GAMES_KEYS.details(id), 'summary'] as const,
  composition: (id: string) => [...GAMES_KEYS.details(id), 'composition'] as const,
  compositionSuggestions: (id: string) => [...GAMES_KEYS.composition(id), 'suggestions'] as const,
};
