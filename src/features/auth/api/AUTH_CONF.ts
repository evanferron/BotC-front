export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  user: (id: string) => `/users/${id}`,
} as const;

export const AUTH_KEYS = {
  all: ['auth'] as const,
  session: () => [...AUTH_KEYS.all, 'session'] as const,
  user: (id: string) => [...AUTH_KEYS.all, 'user', id] as const,
};
