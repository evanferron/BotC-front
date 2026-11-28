import { describe, expect, it } from 'vitest';
import { GAME_POLLING_INTERVAL } from '@common/api/query';
import { gamePollingInterval, parseRealtimeMessage, setGameLive } from './realtime.utils';

describe('parseRealtimeMessage', () => {
  it('lit les messages du serveur', () => {
    expect(parseRealtimeMessage('{"type":"game_changed","game_id":"g"}')).toEqual({
      type: 'game_changed',
      game_id: 'g',
    });
  });

  it('ignore ce qui n’est pas un message', () => {
    expect(parseRealtimeMessage('pas du json')).toBeNull();
    expect(parseRealtimeMessage('{"game_id":"g"}')).toBeNull();
    expect(parseRealtimeMessage(new ArrayBuffer(2))).toBeNull();
  });
});

describe('gamePollingInterval', () => {
  it('ne relit pas en boucle une partie suivie en direct', () => {
    setGameLive('live', true);
    expect(gamePollingInterval('live')).toBe(false);
    setGameLive('live', false);
    expect(gamePollingInterval('live')).toBe(GAME_POLLING_INTERVAL);
    expect(gamePollingInterval('live', 2)).toBe(GAME_POLLING_INTERVAL * 2);
  });
});
