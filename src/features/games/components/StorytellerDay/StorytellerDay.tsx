import { useState } from 'react';
import { Gavel } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { ConfirmSheet } from '@common/components/ConfirmSheet/ConfirmSheet';
import { Loading } from '@common/components/Loading/Loading';
import { showInfo, showSuccess } from '@common/utils/toast.utils';
import { useDayQuery } from '../../api/useDayQuery';
import {
  useCancelNominationMutation,
  useCloseVoteMutation,
  useCouncilMutation,
  useEndDayMutation,
  useNominateMutation,
  useOpenVoteMutation,
} from '../../api/useDayMutations';
import type { Game, Player } from '../../types/game.types';
import type { Nomination } from '../../types/day.types';
import { getOpenVote, getPendingVoters, playerName } from '../../utils/day.utils';
import { getPhaseLabel } from '../../utils/game.utils';
import { EndDaySheet } from '../EndDaySheet/EndDaySheet';
import { NominateSheet } from '../NominateSheet/NominateSheet';
import { NominationCard } from '../NominationCard/NominationCard';
import styles from './StorytellerDay.module.scss';

interface StorytellerDayProps {
  game: Game;
  players: Player[];
  header: React.ReactNode;
}

type OpenSheet = 'nominate' | 'end' | 'close' | 'cancel';

/**
 * Jour côté conteur (design/C5-Jour-Vote) : convoquer le conseil, nommer, ouvrir le vote,
 * le suivre en direct, le clore, puis terminer le jour (exécution de l'échafaud).
 */
export const StorytellerDay = ({ game, players, header }: StorytellerDayProps) => {
  const { data: day, isLoading } = useDayQuery(game.id);
  const { mutate: setCouncil, isPending: isCouncilPending } = useCouncilMutation();
  const { mutateAsync: nominate, isPending: isNominating } = useNominateMutation();
  const { mutate: openVote, isPending: isOpening } = useOpenVoteMutation();
  const { mutateAsync: closeVote, isPending: isClosing } = useCloseVoteMutation();
  const { mutateAsync: cancel, isPending: isCancelling } = useCancelNominationMutation();
  const { mutateAsync: endDay, isPending: isEnding } = useEndDayMutation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  const [target, setTarget] = useState<Nomination>();
  const close = () => setOpenSheet(undefined);

  if (isLoading || !day) {
    return (
      <Screen header={header}>
        <Loading />
      </Screen>
    );
  }

  const voting = getOpenVote(day);
  const pendingVoters = voting ? getPendingVoters(day, voting) : [];
  const isCouncil = game.status === 'Council';

  const handleNominate = async (nominatorId: string, nomineeId: string, suppress: boolean) => {
    try {
      const result = await nominate({
        gameId: game.id,
        nominatorId,
        nomineeId,
        suppressAbilities: suppress,
      });
      if (result.virgin) {
        showInfo(
          `La Vierge se déclenche : ${playerName(players, result.virgin.executed_player_id)} est exécuté. La nuit tombe.`,
          { duration: 8000 }
        );
      }
      close();
    } catch {
      // Toast affiché par la mutation
    }
  };

  const handleCloseVote = async () => {
    if (!voting) return;
    try {
      await closeVote({ gameId: game.id, nominationId: voting.id });
    } catch {
      // Toast affiché par la mutation
    } finally {
      close();
    }
  };

  const handleCancel = async () => {
    if (!target) return;
    try {
      await cancel({ gameId: game.id, nominationId: target.id });
    } catch {
      // Toast affiché par la mutation
    } finally {
      close();
    }
  };

  const handleEndDay = async (execute: boolean, suppress: boolean) => {
    try {
      const result = await endDay({ gameId: game.id, execute, suppressAbilities: suppress });
      if (result.winner) {
        // La raison (Maire, Saint, Démon exécuté, deux vivants) s'affiche sur l'écran de fin
        showSuccess(
          `Fin de partie : victoire ${result.winner === 'Good' ? 'du bon' : 'du mauvais'} camp.`,
          { duration: 8000 }
        );
      } else if (result.executed_player_id) {
        showInfo(`${playerName(players, result.executed_player_id)} est exécuté.`);
      }
      close();
    } catch {
      // Toast affiché par la mutation
    }
  };

  const askCancel = (nomination: Nomination) => {
    setTarget(nomination);
    setOpenSheet('cancel');
  };

  const actionsFor = (nomination: Nomination) => {
    if (nomination.status === 'Nominated') {
      return (
        <div className={styles.actions}>
          <Button
            fullWidth={false}
            disabled={!!voting}
            isLoading={isOpening}
            onClick={() => openVote({ gameId: game.id, nominationId: nomination.id })}
          >
            Ouvrir le vote
          </Button>
          <Button variant="ghost" fullWidth={false} onClick={() => askCancel(nomination)}>
            Annuler
          </Button>
        </div>
      );
    }
    if (nomination.status === 'Voting') {
      return (
        <div className={styles.actions}>
          <Button variant="ghost" fullWidth={false} onClick={() => askCancel(nomination)}>
            Annuler ce vote
          </Button>
        </div>
      );
    }
    return null;
  };

  const footer = voting ? (
    <Button
      size="xl"
      isLoading={isClosing}
      onClick={() => (pendingVoters.length > 0 ? setOpenSheet('close') : void handleCloseVote())}
    >
      Clôturer le vote
    </Button>
  ) : (
    <>
      <Button variant="secondary" onClick={() => setOpenSheet('nominate')}>
        Nommer un joueur
      </Button>
      <Button size="xl" onClick={() => setOpenSheet('end')}>
        Terminer le jour
      </Button>
      <Button
        variant="ghost"
        isLoading={isCouncilPending}
        onClick={() => setCouncil({ gameId: game.id, open: !isCouncil })}
      >
        {isCouncil ? 'Clore le conseil' : 'Convoquer le conseil'}
      </Button>
    </>
  );

  return (
    <Screen header={header} footer={footer}>
      <span className={styles.eyebrow}>
        {getPhaseLabel({ status: 'Day', current_round: game.current_round })}
        {isCouncil && ' · conseil ouvert'}
      </span>

      <Card className={styles.block} tone={day.on_the_block ? 'danger' : 'default'}>
        <Gavel aria-hidden="true" />
        <div>
          <span className={styles.block_label}>Sur l'échafaud</span>
          <strong className={styles.block_name}>
            {day.on_the_block ? playerName(players, day.on_the_block) : 'Personne'}
          </strong>
          <small className={styles.block_hint}>
            {day.alive_count} vivants · seuil de {day.threshold} voix (la moitié, arrondie
            au-dessus). En cas d'égalité, personne.
          </small>
        </div>
      </Card>

      {day.nominations.length === 0 ? (
        <p className={styles.empty}>
          Aucune nomination aujourd'hui. Enregistrez-les au fil des annonces.
        </p>
      ) : (
        <ul className={styles.list} aria-label="Nominations du jour">
          {[...day.nominations].reverse().map((nomination) => (
            <li key={nomination.id}>
              <NominationCard nomination={nomination} day={day} players={players} showVoters>
                {actionsFor(nomination)}
              </NominationCard>
            </li>
          ))}
        </ul>
      )}

      {openSheet === 'nominate' && (
        <NominateSheet
          players={players}
          day={day}
          isLoading={isNominating}
          onConfirm={(nominator, nominee, suppress) =>
            void handleNominate(nominator, nominee, suppress)
          }
          onClose={close}
        />
      )}
      {openSheet === 'end' && (
        <EndDaySheet
          day={day}
          players={players}
          isLoading={isEnding}
          onConfirm={(execute, suppress) => void handleEndDay(execute, suppress)}
          onClose={close}
        />
      )}
      <ConfirmSheet
        open={openSheet === 'close'}
        title="Clôturer le vote ?"
        description={`${pendingVoters.length} joueur${pendingVoters.length > 1 ? 's' : ''} n'${pendingVoters.length > 1 ? 'ont' : 'a'} pas voté : ${pendingVoters.length > 1 ? 'ils comptent' : 'il compte'} contre. Le résultat sera définitif.`}
        confirmLabel="Clôturer le vote"
        tone="primary"
        isLoading={isClosing}
        onConfirm={() => void handleCloseVote()}
        onCancel={close}
      />
      <ConfirmSheet
        open={openSheet === 'cancel'}
        title="Annuler la nomination ?"
        description={
          target?.status === 'Voting'
            ? 'Le vote en cours est effacé et les voix fantômes utilisées sont rendues.'
            : 'La nomination disparaît, comme si elle n’avait pas eu lieu.'
        }
        confirmLabel="Annuler la nomination"
        cancelLabel="Garder"
        isLoading={isCancelling}
        onConfirm={() => void handleCancel()}
        onCancel={close}
      />
    </Screen>
  );
};
