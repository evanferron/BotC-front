import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Sunrise } from 'lucide-react';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@/components/PhaseBar/PhaseBar';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Loading } from '@/components/Loading/Loading';
import { AUTH_ROUTES } from '@/config/routes.config';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useNightQuery } from '../../api/useNightQuery';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import { useNightStepMutation } from '../../api/useNightStepMutation';
import { useEndNightMutation } from '../../api/useEndNightMutation';
import type { Game, Player, RoleSummary } from '../../types/game.types';
import type { NightStep, StepChoice } from '../../types/night.types';
import { getPhaseLabel } from '../../utils/game.utils';
import { getActionHint, getStepTitle, isOpenStatus, isTeamInfoStep } from '../../utils/night.utils';
import { EndNightSheet } from '../EndNightSheet/EndNightSheet';
import { NightStepList } from '../NightStepList/NightStepList';
import { SendInfoSheet } from '../SendInfoSheet/SendInfoSheet';
import { StepChoiceSheet } from '../StepChoiceSheet/StepChoiceSheet';
import styles from './StorytellerNight.module.scss';

interface StorytellerNightProps {
  game: Game;
}

type OpenSheet = 'info' | 'choice' | 'end';

// Choix d'une étape en clair : « Inès », « Marc et Lou », « Moine »
const formatChoice = (step: NightStep, players: Player[], roles: RoleSummary[]) => {
  const pseudo = (id: string | null) => players.find((p) => p.id === id)?.pseudo;
  const names = [pseudo(step.target_id), pseudo(step.second_target_id)].filter(Boolean);
  const role = roles.find((r) => r.id === step.target_role_id)?.name;
  return [names.join(' et '), role].filter(Boolean).join(' · ') || undefined;
};

// Ce que le conteur dit à voix basse
const getScript = (step: NightStep) => {
  if (isTeamInfoStep(step)) {
    return step.action_type === 'minion_info'
      ? '« Sbires, ouvrez les yeux. Reconnaissez-vous et regardez votre Démon. »'
      : '« Démon, ouvrez les yeux. Voici vos Sbires et trois rôles absents. »';
  }
  const name = step.role?.name ?? 'Joueur';
  return `« ${name}, ouvrez les yeux. »`;
};

// Écrans 10 et 12 (C3-Nuit) : le conteur réveille les rôles un par un
export const StorytellerNight = ({ game }: StorytellerNightProps) => {
  const navigate = useNavigate();
  const { data: night, isLoading } = useNightQuery(game.id, true);
  const { data: players = [] } = usePlayersQuery(game.id);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { mutateAsync: runStep, isPending: isRunning } = useNightStepMutation();
  const { mutateAsync: endNight, isPending: isEnding } = useEndNightMutation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  const closeSheet = useCallback(() => setOpenSheet(undefined), []);

  const steps = night?.steps ?? [];
  const current = steps.find((s) => isOpenStatus(s.status));
  const openSteps = steps.filter((s) => isOpenStatus(s.status)).length;
  const title = night?.is_first_night ? 'Première nuit' : `Nuit ${night?.round ?? ''}`;

  const run = async (
    action: 'activate' | 'skip' | 'resolve',
    extra?: { decision: 'Accepted' | 'Modified' | 'Ignored'; choice?: StepChoice }
  ) => {
    if (!current) return;
    try {
      if (action === 'resolve' && extra) {
        await runStep({ gameId: game.id, stepId: current.id, action, ...extra });
      } else if (action !== 'resolve') {
        await runStep({ gameId: game.id, stepId: current.id, action });
      }
      setOpenSheet(undefined);
    } catch {
      // Toast affiché par la mutation
    }
  };

  const handleEndNight = async (deaths: string[]) => {
    try {
      await endNight({ gameId: game.id, deaths });
    } catch {
      // Toast affiché par la mutation
    }
  };

  const header = (
    <PhaseBar
      title={title}
      variant="night"
      tag={getPhaseLabel(game)}
      meta={current ? `Étape ${current.step_order} / ${steps.length}` : undefined}
      actions={
        <>
          <PhaseBarAction aria-label="Envoyer une information" onClick={() => setOpenSheet('info')}>
            <MessageSquare aria-hidden="true" />
          </PhaseBarAction>
          <PhaseBarAction aria-label="Terminer la nuit" onClick={() => setOpenSheet('end')}>
            <Sunrise aria-hidden="true" />
          </PhaseBarAction>
          <PhaseBarAction
            aria-label="Retour à mes parties"
            onClick={() => void navigate(AUTH_ROUTES.GAMES)}
          >
            <ArrowLeft aria-hidden="true" />
          </PhaseBarAction>
        </>
      }
    />
  );

  if (isLoading || !night) {
    return (
      <Screen header={header}>
        <Loading label="Préparation de la nuit…" />
      </Screen>
    );
  }

  const actor = current?.actor;
  const choiceLabel = current ? formatChoice(current, players, roles) : undefined;

  const footer = (() => {
    if (!current) {
      return (
        <Button size="xl" onClick={() => setOpenSheet('end')}>
          Terminer la nuit
        </Button>
      );
    }
    switch (current.status) {
      case 'Pending':
        if (isTeamInfoStep(current)) {
          return (
            <>
              <Button size="xl" isLoading={isRunning} onClick={() => void run('activate')}>
                Envoyer les informations
              </Button>
              <Button variant="ghost" disabled={isRunning} onClick={() => void run('skip')}>
                Passer cette étape
              </Button>
            </>
          );
        }
        if (!actor) {
          return (
            <Button size="xl" isLoading={isRunning} onClick={() => void run('skip')}>
              Étape suivante
            </Button>
          );
        }
        return (
          <>
            <Button size="xl" isLoading={isRunning} onClick={() => void run('activate')}>
              Réveiller {actor.pseudo}
            </Button>
            <Button variant="secondary" onClick={() => setOpenSheet('info')}>
              Envoyer une info
            </Button>
            <Button variant="ghost" disabled={isRunning} onClick={() => void run('skip')}>
              Passer cette étape
            </Button>
          </>
        );
      case 'WaitingPlayer':
        return (
          <>
            <Button variant="secondary" onClick={() => setOpenSheet('info')}>
              Envoyer une info
            </Button>
            <Button variant="secondary" onClick={() => setOpenSheet('choice')}>
              {current.action_kind === 'Confirm' ? 'Valider sans attendre' : 'Choisir à sa place'}
            </Button>
            <Button variant="ghost" disabled={isRunning} onClick={() => void run('skip')}>
              Passer cette étape
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button
              size="xl"
              isLoading={isRunning}
              onClick={() => void run('resolve', { decision: 'Accepted' })}
            >
              Accepter
            </Button>
            {current.action_kind !== 'Confirm' && (
              <Button variant="secondary" onClick={() => setOpenSheet('choice')}>
                Modifier
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={isRunning}
              onClick={() => void run('resolve', { decision: 'Ignored' })}
            >
              Ignorer
            </Button>
          </>
        );
    }
  })();

  return (
    <Screen header={header} footer={footer}>
      {current ? (
        <Card tone="accent" className={styles.current}>
          <span className={styles.eyebrow}>
            {
              {
                Pending:
                  actor || isTeamInfoStep(current)
                    ? 'Réveillez maintenant'
                    : 'Réveillez quand même',
                WaitingPlayer: `${actor?.pseudo ?? 'Le joueur'} réfléchit…`,
                Received: 'Choix reçu',
              }[current.status as 'Pending' | 'WaitingPlayer' | 'Received']
            }
          </span>
          <h2 className={styles.title}>
            {getStepTitle(current)}
            {actor && <span className={styles.actor}> · {actor.pseudo}</span>}
          </h2>
          {actor?.believes_role && (
            <p className={styles.warning}>Ce joueur croit avoir ce rôle (Ivrogne).</p>
          )}
          {actor && !actor.is_alive && (
            <p className={styles.warning}>
              Ce joueur est mort : passez l'étape si son rôle ne joue plus.
            </p>
          )}

          {current.status === 'Received' ? (
            <div className={styles.block}>
              <span className={styles.label}>Son choix</span>
              <p className={styles.choice}>
                {current.action_kind === 'Confirm' ? 'A compris' : (choiceLabel ?? '—')}
              </p>
              <p className={styles.text}>Rien n'est appliqué tant que vous n'avez pas répondu.</p>
            </div>
          ) : (
            <>
              {!actor && !isTeamInfoStep(current) && (
                <p className={styles.text}>
                  Aucun joueur n'a ce rôle. Respectez le même rythme pour ne rien trahir.
                </p>
              )}
              <div className={styles.block}>
                <span className={styles.label}>À faire</span>
                <p className={styles.text}>
                  {current.reminder ??
                    current.role?.ability_description ??
                    (isTeamInfoStep(current)
                      ? 'Les informations partent sur les téléphones concernés.'
                      : getActionHint(current.action_kind))}
                </p>
                {actor && current.status === 'Pending' && (
                  <p className={styles.text}>{getActionHint(current.action_kind)}</p>
                )}
              </div>
              <div className={styles.block}>
                <span className={styles.label}>À dire</span>
                <p className={styles.quote}>{getScript(current)}</p>
              </div>
              {current.action_type === 'demon_info' && night.demon_bluffs.length > 0 && (
                <div className={styles.block}>
                  <span className={styles.label}>Bluffs</span>
                  <p className={styles.text}>{night.demon_bluffs.map((r) => r.name).join(', ')}</p>
                </div>
              )}
            </>
          )}
        </Card>
      ) : (
        <Card tone="accent" className={styles.current}>
          <span className={styles.eyebrow}>Fin de la nuit</span>
          <h2 className={styles.title}>Toutes les étapes sont traitées</h2>
          <p className={styles.text}>Désignez les morts éventuels, puis levez le jour.</p>
        </Card>
      )}

      <NightStepList steps={steps} currentId={current?.id} />

      {openSheet === 'info' && (
        <SendInfoSheet
          gameId={game.id}
          players={players}
          roles={roles}
          defaultRecipientId={actor?.id}
          stepId={current?.id}
          onClose={closeSheet}
        />
      )}
      {openSheet === 'choice' && current && (
        <StepChoiceSheet
          step={current}
          players={players}
          roles={roles}
          originalLabel={current.status === 'Received' ? choiceLabel : undefined}
          isLoading={isRunning}
          onApply={(choice) => void run('resolve', { decision: 'Modified', choice })}
          onClose={closeSheet}
        />
      )}
      {openSheet === 'end' && (
        <EndNightSheet
          players={players}
          openSteps={openSteps}
          isLoading={isEnding}
          onConfirm={(deaths) => void handleEndNight(deaths)}
          onClose={closeSheet}
        />
      )}
    </Screen>
  );
};
