import { Check, Hourglass, X } from 'lucide-react';
import { Card } from '@common/components/Card/Card';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { Pill } from '@common/components/Pill/Pill';
import { cx } from '@common/utils/className.utils';
import type { Player } from '@games/types/game.types';
import type { Day, Nomination } from '@games/types/day.types';
import { getPendingVoters, playerName } from '@games/utils/day.utils';
import styles from './NominationCard.module.scss';

interface NominationCardProps {
  nomination: Nomination;
  day: Day;
  players: Player[];
  // Détail des votes par joueur (vue conteur, et résultat public)
  showVoters?: boolean;
  children?: React.ReactNode;
}

const STATUS_LABELS: Record<Nomination['status'], string> = {
  Nominated: 'Nommé',
  Voting: 'Vote en cours',
  Closed: 'Vote clos',
  Cancelled: 'Annulée',
};

/**
 * Une nomination du jour : qui est nommé et par qui, la jauge pour / contre / en attente et le
 * seuil (design/C5-Jour-Vote, design/J4-Jour-Vote). Le rouge n'apparaît que pour le vote.
 */
export const NominationCard = ({
  nomination,
  day,
  players,
  showVoters = false,
  children,
}: NominationCardProps) => {
  const isVoting = nomination.status === 'Voting';
  const pending = isVoting ? getPendingVoters(day, nomination) : [];
  const total = nomination.yes_count + nomination.no_count + pending.length;
  const reached = nomination.yes_count >= day.threshold;

  return (
    <Card className={cx(styles.card, isVoting && styles.voting)}>
      <div className={styles.head}>
        <PlayerDisc name={playerName(players, nomination.nominee_id)} />
        <div className={styles.who}>
          <span className={styles.nominee}>{playerName(players, nomination.nominee_id)}</span>
          {nomination.nominator_id && (
            <span className={styles.by}>
              nommé par {playerName(players, nomination.nominator_id)}
            </span>
          )}
        </div>
        <Pill tone={isVoting ? 'highlight' : 'default'}>
          {nomination.executed ? 'Exécuté' : STATUS_LABELS[nomination.status]}
        </Pill>
      </div>

      {nomination.status !== 'Nominated' && (
        <>
          <div className={styles.gauge} aria-hidden="true">
            {total > 0 && (
              <>
                <span className={styles.yes} style={{ flexGrow: nomination.yes_count }} />
                <span className={styles.no} style={{ flexGrow: nomination.no_count }} />
                <span className={styles.wait} style={{ flexGrow: pending.length }} />
              </>
            )}
          </div>
          <p className={styles.counts}>
            <strong>{nomination.yes_count} pour</strong> · {nomination.no_count} contre
            {isVoting && ` · ${pending.length} en attente`}
          </p>
          <p className={cx(styles.threshold, reached && styles.reached)}>
            Seuil pour exécuter : {day.threshold} voix
            {nomination.status === 'Closed' && (reached ? ' · atteint' : ' · non atteint')}
          </p>
        </>
      )}

      {showVoters && nomination.status !== 'Nominated' && (
        <ul className={styles.voters} aria-label="Votes">
          {nomination.votes.map((vote) => (
            <li key={vote.voter_id} className={styles.voter}>
              {vote.is_yes ? (
                <Check aria-hidden="true" className={styles.icon_yes} />
              ) : (
                <X aria-hidden="true" className={styles.icon_no} />
              )}
              <span>{playerName(players, vote.voter_id)}</span>
              <small>
                {vote.is_yes ? 'pour' : 'contre'}
                {vote.used_ghost_vote && ' · voix fantôme'}
              </small>
            </li>
          ))}
          {pending.map((id) => (
            <li key={id} className={cx(styles.voter, styles.waiting)}>
              <Hourglass aria-hidden="true" />
              <span>{playerName(players, id)}</span>
              <small>en attente</small>
            </li>
          ))}
        </ul>
      )}

      {children}
    </Card>
  );
};
