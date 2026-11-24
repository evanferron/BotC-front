import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ReconnectingWebSocket from 'partysocket/ws';
import { getAccessToken } from '@auth/utils/token.utils';
import { refreshAccessToken } from '@auth/api/refreshAccessToken';
import { GAMES_KEYS } from '../api/GAMES_CONF';
import {
  isGameLive,
  parseRealtimeMessage,
  realtimeUrl,
  setGameLive,
  subscribeGameLive,
} from '../utils/realtime.utils';

// Refus définitifs : se reconnecter n'y changerait rien
// RATE_LIMITED : trop d'écrans ouverts par ce compte ; cet écran se contente de la relecture périodique
const FATAL_CODES = new Set([
  'GAME_NOT_FOUND',
  'INVALID_PATH_PARAM',
  'MALFORMED_JSON',
  'RATE_LIMITED',
]);
// Token refusé : un nouveau token, puis la reconnexion automatique renvoie le hello
const AUTH_CODES = new Set(['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED']);

/**
 * Temps réel d'une partie : un WebSocket qui prévient quand elle change. Chaque signal invalide
 * les données de la partie, relues par l'API REST (le serveur n'envoie jamais de données par ce
 * canal). Reconnexion automatique ; à chaque (ré)abonnement tout est relu pour rattraper ce qui a
 * été manqué. Tant que la connexion est coupée, les écrans reviennent à la relecture périodique.
 *
 * Renvoie `true` quand la partie est suivie en direct.
 */
export const useGameRealtime = (gameId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!gameId) return;
    const refresh = () =>
      void queryClient.invalidateQueries({ queryKey: GAMES_KEYS.details(gameId) });
    const goOffline = () => {
      if (!isGameLive(gameId)) return;
      setGameLive(gameId, false);
      // Relance les lectures pour qu'elles repassent en relecture périodique
      refresh();
    };

    const socket = new ReconnectingWebSocket(realtimeUrl, [], {
      minReconnectionDelay: 500 + Math.random() * 1000,
      maxReconnectionDelay: 10_000,
    });

    const sendHello = async () => {
      try {
        const token = getAccessToken() ?? (await refreshAccessToken());
        socket.send(JSON.stringify({ type: 'hello', token, game_id: gameId }));
      } catch {
        // Session perdue : l'intercepteur HTTP renverra vers la connexion
        socket.close();
      }
    };

    socket.addEventListener('open', () => void sendHello());
    socket.addEventListener('close', goOffline);
    socket.addEventListener('message', (event) => {
      const message = parseRealtimeMessage(event.data);
      if (!message) return;
      switch (message.type) {
        case 'subscribed':
          setGameLive(gameId, true);
          refresh();
          break;
        case 'game_changed':
          refresh();
          break;
        case 'error':
          if (AUTH_CODES.has(message.code)) {
            void refreshAccessToken().catch(() => socket.close());
          } else if (FATAL_CODES.has(message.code)) {
            socket.close();
            refresh();
          }
          break;
      }
    });

    return () => {
      socket.close();
      setGameLive(gameId, false);
    };
  }, [gameId, queryClient]);

  return useSyncExternalStore(
    subscribeGameLive,
    () => (gameId ? isGameLive(gameId) : false),
    () => false
  );
};
