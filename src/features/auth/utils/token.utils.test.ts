import { describe, expect, it } from 'vitest';
import { getUserIdFromToken } from './token.utils';

// JWT non signé (le client ne vérifie pas la signature) avec la charge utile donnée, en base64url
const jwt = (payload: unknown) => {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
};

describe('getUserIdFromToken', () => {
  it('lit le sub du token', () => {
    expect(getUserIdFromToken(jwt({ sub: 'c0ffee00-0000-4000-8000-000000000000' }))).toBe(
      'c0ffee00-0000-4000-8000-000000000000'
    );
  });

  it('décode le base64url, sans bourrage', () => {
    // « >>> » et « ??? » donnent `+` et `/` en base64, donc `-` et `_` en base64url
    const token = jwt({ sub: '>>>???' });
    expect(token.split('.')[1]).toMatch(/[-_]/);
    expect(getUserIdFromToken(token)).toBe('>>>???');
  });

  it('renvoie null pour un token illisible ou sans sub', () => {
    expect(getUserIdFromToken('pas-un-jwt')).toBeNull();
    expect(getUserIdFromToken(jwt({ exp: 1 }))).toBeNull();
    expect(getUserIdFromToken('a.%%%.c')).toBeNull();
  });
});
