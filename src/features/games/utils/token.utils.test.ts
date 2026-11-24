import { describe, expect, it } from 'vitest';
import { describeTokens, sortTokens } from './token.utils';

describe('token.utils', () => {
  it('trie les statuts dans l’ordre du serveur', () => {
    expect(sortTokens(['Marked', 'Poisoned', 'Protected'])).toEqual([
      'Poisoned',
      'Protected',
      'Marked',
    ]);
  });

  it('décrit les statuts en clair', () => {
    expect(describeTokens(['Protected', 'Drunk'])).toBe('Ivre, Protégé');
    expect(describeTokens([])).toBe('');
  });
});
