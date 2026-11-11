export const GAMES_ENDPOINT = '/games';

export const GAMES_ENDPOINTS = {
  join: `${GAMES_ENDPOINT}/join`,
  game: (id: string) => `${GAMES_ENDPOINT}/${id}`,
  players: (id: string) => `${GAMES_ENDPOINT}/${id}/players`,
  player: (id: string, playerId: string) => `${GAMES_ENDPOINT}/${id}/players/${playerId}`,
  leave: (id: string) => `${GAMES_ENDPOINT}/${id}/leave`,
} as const;

export const GAMES_KEYS = {
  all: ['games'] as const,
  lists: () => [...GAMES_KEYS.all, 'lists'] as const,
  list: () => [...GAMES_KEYS.lists()] as const,
  details: (id: string) => [...GAMES_KEYS.all, 'details', id] as const,
  players: (id: string) => [...GAMES_KEYS.details(id), 'players'] as const,
};
