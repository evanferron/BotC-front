import { API_BASE_URL } from '@common/config/api.config';
import { GAME_POLLING_INTERVAL } from '@common/api/query';

// Parties dont le WebSocket est abonné : leurs écrans n'ont pas besoin d'être relus en boucle
const liveGames = new Set<string>();
const listeners = new Set<() => void>();

export const isGameLive = (gameId: string) => liveGames.has(gameId);

export const setGameLive = (gameId: string, live: boolean) => {
  if (live === liveGames.has(gameId)) return;
  if (live) liveGames.add(gameId);
  else liveGames.delete(gameId);
  listeners.forEach((listener) => listener());
};

export const subscribeGameLive = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Relecture périodique d'une donnée de partie, en secours seulement : tant que le WebSocket est
 * abonné, c'est lui qui signale les changements (`false` = pas de relecture).
 */
export const gamePollingInterval = (gameId: string | undefined, factor = 1): number | false =>
  gameId && isGameLive(gameId) ? false : GAME_POLLING_INTERVAL * factor;

// URL du WebSocket, sur la même origine que l'API (`/api` relatif en dev, absolu sinon)
export const realtimeUrl = () => {
  const url = new URL(`${API_BASE_URL}/ws`, window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

// Messages du serveur (`modules::realtime::dto::ServerMessage`)
export type RealtimeMessage =
  | { type: 'subscribed'; game_id: string }
  | { type: 'game_changed'; game_id: string }
  | { type: 'error'; code: string };

export const parseRealtimeMessage = (data: unknown): RealtimeMessage | null => {
  if (typeof data !== 'string') return null;
  try {
    const message = JSON.parse(data) as Partial<RealtimeMessage>;
    return typeof message.type === 'string' ? (message as RealtimeMessage) : null;
  } catch {
    return null;
  }
};
