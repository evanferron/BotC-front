export const SCRIPTS_ENDPOINT = '/scripts';

export const SCRIPTS_ENDPOINTS = {
  list: SCRIPTS_ENDPOINT,
  script: (id: string) => `${SCRIPTS_ENDPOINT}/${encodeURIComponent(id)}`,
} as const;

export const SCRIPTS_KEYS = {
  all: ['scripts'] as const,
  list: () => [...SCRIPTS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...SCRIPTS_KEYS.all, 'detail', id] as const,
};

// Le catalogue change rarement : relu au plus une fois par jour
export const SCRIPTS_STALE_TIME = 24 * 60 * 60 * 1000;
