import { Ghost, Skull } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { Pill } from '@common/components/Pill/Pill';
import { vibrate } from '@common/utils/haptics.utils';
import { useAuth } from '@auth/hooks/useAuth';
import { PinnedRoleRow } from '@scripts/components/PinnedRoleRow/PinnedRoleRow';
import { useCardsQuery } from '../../api/useCardsQuery';
import { useDayQuery } from '../../api/useDayQuery';
import { useVoteMutation } from '../../api/useDayMutations';
import type { Game, Player } from '../../types/game.types';
import type { Day, Nomination } from '../../types/day.types';
import {
  getLastClosed,
  getOpenVote,
  getPendingNomination,
  getPendingVoters,
  playerName,
} from '../../utils/day.utils';
import { NominationCard } from '../NominationCard/NominationCard';
import styles from './PlayerDay.module.scss';

interface PlayerDayProps {
  game: Game;
  players: Player[];
  header: React.ReactNode;
}

// Motif « vote enregistré » (design/Navigation-Vibrations : réponse à son propre geste)
const VOTE_SENT = [12, 60, 12];

/**
 * Jour côté joueur (design/J4-Jour-Vote) : vivants et morts, nomination en cours, vote dans
 * l'appli (en levant aussi le bras), vote fantôme des morts, résultat.
 */
export const PlayerDay = ({ game, players, header }: PlayerDayProps) => {
  const { userId } = useAuth();
  const { data: day } = useDayQuery(game.id);
  const { data: distribution } = useCardsQuery(game.id);
  const { mutate: vote, isPending: isVoting, variables } = useVoteMutation();
  const me = players.find((p) => p.user_id === userId);
  const voting = getOpenVote(day);

  const sendVote = (isYes: boolean) => {
    if (!voting) return;
    vote(
      { gameId: game.id, nominationId: voting.id, isYes },
      { onSuccess: () => vibrate(VOTE_SENT) }
    );
  };

  if (day && voting && me) {
    const myVote = voting.votes.find((v) => v.voter_id === me.id);
    const waiting = getPendingVoters(day, voting).length;
    const name = playerName(players, voting.nominee_id);

    let footer: React.ReactNode = null;
    let message: React.ReactNode;
    if (myVote) {
      message = (
        <p className={styles.message}>
          Vote enregistré : <strong>{myVote.is_yes ? 'pour' : 'contre'}</strong>.{' '}
          {waiting > 0
            ? `En attente de ${waiting} joueur${waiting > 1 ? 's' : ''}.`
            : 'Tout le monde a voté.'}
        </p>
      );
    } else if (me.is_alive) {
      message = (
        <p className={styles.message}>Levez aussi le bras à la table. Votre vote est définitif.</p>
      );
      footer = (
        <div className={styles.choices}>
          <Button
            variant="danger"
            size="xl"
            isLoading={isVoting && variables?.isYes === true}
            disabled={isVoting}
            onClick={() => sendVote(true)}
          >
            Pour
          </Button>
          <Button
            variant="secondary"
            size="xl"
            isLoading={isVoting && variables?.isYes === false}
            disabled={isVoting}
            onClick={() => sendVote(false)}
          >
            Contre
          </Button>
        </div>
      );
    } else if (me.has_ghost_vote) {
      message = (
        <p className={styles.message}>
          Vous êtes mort. Il vous reste une voix fantôme : elle ne sert qu'une fois par partie, et
          seulement pour condamner.
        </p>
      );
      footer = (
        <>
          <Button
            variant="danger"
            size="xl"
            isLoading={isVoting && variables?.isYes === true}
            disabled={isVoting}
            onClick={() => sendVote(true)}
          >
            Utiliser ma voix : pour
          </Button>
          <Button variant="secondary" disabled={isVoting} onClick={() => sendVote(false)}>
            Garder ma voix
          </Button>
        </>
      );
    } else {
      message = (
        <p className={styles.message}>
          Votre voix fantôme est déjà utilisée. Vous suivez le vote sans y prendre part.
        </p>
      );
    }

    return (
      <Screen header={header} footer={footer}>
        <span className={styles.eyebrow}>Vote</span>
        <h2 className={styles.title}>Faut-il exécuter {name} ?</h2>
        <NominationCard nomination={voting} day={day} players={players} showVoters />
        {message}
      </Screen>
    );
  }

  const pending = getPendingNomination(day);
  const lastClosed = getLastClosed(day);
  const alive = players.filter((p) => p.is_alive).length;

  return (
    <Screen
      header={header}
      footer={<p className={styles.footnote}>Discutez. Le Conteur annoncera la suite.</p>}
    >
      {me && !me.is_alive && (
        <DeadCard hasGhostVote={me.has_ghost_vote}>
          {distribution?.my_role && <PinnedRoleRow role={distribution.my_role} />}
        </DeadCard>
      )}

      {day && pending ? (
        <PendingNomination nomination={pending} players={players} />
      ) : (
        <>
          <span className={styles.eyebrow}>Au village</span>
          <h2 className={styles.title}>
            {alive} vivant{alive > 1 ? 's' : ''} · {players.length - alive} mort
            {players.length - alive > 1 ? 's' : ''}
          </h2>
        </>
      )}

      {day && lastClosed && <LastResult day={day} nomination={lastClosed} players={players} />}

      <ul className={styles.list} aria-label="Joueurs">
        {[...players]
          .sort((a, b) => (a.seat_position ?? Infinity) - (b.seat_position ?? Infinity))
          .map((player) => (
            <li key={player.id} className={styles.row}>
              <PlayerDisc name={player.pseudo} dead={!player.is_alive} />
              <span className={styles.name}>
                {player.pseudo}
                {player.user_id === userId && <small>Vous</small>}
              </span>
              {!player.is_alive &&
                (player.has_ghost_vote ? (
                  <Pill icon={<Ghost aria-hidden="true" />}>Voix disponible</Pill>
                ) : (
                  <Pill icon={<Skull aria-hidden="true" />}>Voix utilisée</Pill>
                ))}
            </li>
          ))}
      </ul>
    </Screen>
  );
};

// Écran 22a : un mort garde la parole, et sa voix fantôme tant qu'il ne l'a pas utilisée
const DeadCard = ({
  hasGhostVote,
  children,
}: {
  hasGhostVote: boolean;
  children: React.ReactNode;
}) => (
  <Card className={styles.dead}>
    <span className={styles.eyebrow}>Vous êtes mort</span>
    <p className={styles.message}>
      {hasGhostVote
        ? 'Vous gardez la parole et une voix fantôme pour condamner.'
        : 'Vous gardez la parole. Votre voix fantôme est utilisée.'}
    </p>
    <Pill icon={hasGhostVote ? <Ghost aria-hidden="true" /> : <Skull aria-hidden="true" />}>
      {hasGhostVote ? 'Voix fantôme disponible' : 'Voix fantôme utilisée'}
    </Pill>
    {children}
    <small className={styles.hint}>Votre rôle reste secret. Les vivants ne le voient pas.</small>
  </Card>
);

// Écran 14b : un joueur est nommé, la table délibère
const PendingNomination = ({
  nomination,
  players,
}: {
  nomination: Nomination;
  players: Player[];
}) => (
  <Card className={styles.nominated}>
    <span className={styles.eyebrow}>Nomination</span>
    <div className={styles.nominee}>
      <PlayerDisc name={playerName(players, nomination.nominee_id)} size="large" />
      <div>
        <strong>{playerName(players, nomination.nominee_id)} est nommé.</strong>
        {nomination.nominator_id && (
          <span>Par {playerName(players, nomination.nominator_id)}.</span>
        )}
      </div>
    </div>
    <p className={styles.message}>
      La table délibère, parlez à voix haute. Le Conteur ouvrira le vote.
    </p>
  </Card>
);

// Écran 16e : résultat du dernier vote et échafaud du jour
const LastResult = ({
  day,
  nomination,
  players,
}: {
  day: Day;
  nomination: Nomination;
  players: Player[];
}) => (
  <>
    <NominationCard nomination={nomination} day={day} players={players} showVoters />
    <p className={styles.message}>
      {day.on_the_block
        ? `Sur l'échafaud : ${playerName(players, day.on_the_block)}. Exécution à la fin du jour.`
        : "Personne n'est sur l'échafaud pour l'instant."}
    </p>
  </>
);
