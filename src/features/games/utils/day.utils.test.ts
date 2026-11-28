import { describe, expect, it } from 'vitest';
import type { Day, Nomination } from '../types/day.types';
import {
  getLastClosed,
  getNominationsUsed,
  getOpenVote,
  getPendingNomination,
  getPendingVoters,
} from './day.utils';

const nomination = (id: string, status: Nomination['status'], extra: Partial<Nomination> = {}) =>
  ({
    id,
    nominee_id: `nominee-${id}`,
    nominator_id: `nominator-${id}`,
    status,
    yes_count: 0,
    no_count: 0,
    votes: [],
    executed: false,
    ...extra,
  }) satisfies Nomination;

const day = (nominations: Nomination[], eligible: string[] = []): Day => ({
  round: 2,
  status: 'Council',
  alive_count: 5,
  threshold: 3,
  eligible_voter_ids: eligible,
  nominations,
  on_the_block: null,
});

describe('nominations du jour', () => {
  const today = day([
    nomination('1', 'Closed'),
    nomination('2', 'Closed'),
    nomination('3', 'Nominated'),
    nomination('4', 'Nominated'),
  ]);

  it('trouve le dernier vote clos et la dernière nomination sans vote', () => {
    expect(getLastClosed(today)?.id).toBe('2');
    expect(getPendingNomination(today)?.id).toBe('4');
    expect(getOpenVote(today)).toBeUndefined();
  });

  it('trouve le vote ouvert', () => {
    expect(getOpenVote(day([nomination('1', 'Closed'), nomination('2', 'Voting')]))?.id).toBe('2');
    expect(getOpenVote(undefined)).toBeUndefined();
  });

  it('liste qui a déjà nommé et été nommé', () => {
    const used = getNominationsUsed(day([nomination('1', 'Closed', { nominator_id: null })]));
    expect([...used.nominators]).toEqual([]);
    expect([...used.nominees]).toEqual(['nominee-1']);
  });
});

describe('getPendingVoters', () => {
  it('renvoie les votants attendus qui n’ont pas encore voté', () => {
    const vote = nomination('1', 'Voting', {
      votes: [{ voter_id: 'b', is_yes: true, used_ghost_vote: false }],
    });
    expect(getPendingVoters(day([vote], ['a', 'b', 'c']), vote)).toEqual(['a', 'c']);
  });
});
