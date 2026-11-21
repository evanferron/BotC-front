import type { Player } from '../types/game.types';
import type { Day, Nomination } from '../types/day.types';

// Vote en cours, s'il y en a un
export const getOpenVote = (day: Day | undefined): Nomination | undefined =>
  day?.nominations.find((n) => n.status === 'Voting');

// Dernière nomination encore sans vote
export const getPendingNomination = (day: Day | undefined): Nomination | undefined =>
  day?.nominations.filter((n) => n.status === 'Nominated').at(-1);

// Dernier vote clos du jour
export const getLastClosed = (day: Day | undefined): Nomination | undefined =>
  day?.nominations.filter((n) => n.status === 'Closed').at(-1);

// Joueurs qui n'ont pas encore répondu au vote
export const getPendingVoters = (day: Day, nomination: Nomination): string[] =>
  day.eligible_voter_ids.filter((id) => !nomination.votes.some((v) => v.voter_id === id));

export const playerName = (players: Player[], id: string | null | undefined) =>
  players.find((p) => p.id === id)?.pseudo ?? 'Joueur inconnu';

// Joueurs qui ont déjà nommé / été nommés aujourd'hui (une fois par jour chacun)
export const getNominationsUsed = (day: Day | undefined) => ({
  nominators: new Set(day?.nominations.map((n) => n.nominator_id).filter(Boolean) as string[]),
  nominees: new Set(day?.nominations.map((n) => n.nominee_id)),
});

export const formatVotes = (count: number) => `${count} voix`;
