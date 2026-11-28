import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { JOIN_ERROR_MESSAGES, getJoinErrorMessage } from './joinError.utils';

const apiError = (status: number, code: string) =>
  new AxiosError('erreur', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { code },
  } satisfies AxiosResponse);

describe('getJoinErrorMessage', () => {
  it('traduit les codes de l’API', () => {
    expect(getJoinErrorMessage(apiError(404, 'ROOM_CODE_NOT_FOUND'))).toBe(
      JOIN_ERROR_MESSAGES.NOT_FOUND
    );
    expect(getJoinErrorMessage(apiError(409, 'GAME_FULL'))).toBe(JOIN_ERROR_MESSAGES.FULL);
    expect(getJoinErrorMessage(apiError(409, 'GAME_ALREADY_STARTED'))).toBe(
      JOIN_ERROR_MESSAGES.STARTED
    );
    expect(getJoinErrorMessage(apiError(409, 'CONFLICT'))).toBe(JOIN_ERROR_MESSAGES.STORYTELLER);
    expect(getJoinErrorMessage(apiError(403, 'REMOVED_FROM_GAME'))).toBe(
      JOIN_ERROR_MESSAGES.REMOVED
    );
  });

  it('distingue le réseau coupé d’une erreur inconnue', () => {
    expect(getJoinErrorMessage(new AxiosError('réseau', 'ERR_NETWORK'))).toBe(
      JOIN_ERROR_MESSAGES.NETWORK
    );
    expect(getJoinErrorMessage(new Error('?'))).toBe(JOIN_ERROR_MESSAGES.UNKNOWN);
  });
});
