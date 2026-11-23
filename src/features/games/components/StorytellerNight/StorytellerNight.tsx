import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Sunrise } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { Loading } from '@common/components/Loading/Loading';
import { AUTH_ROUTES } from '@common/config/routes.config';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import { useNightQuery } from '../../api/useNightQuery';
import { useScriptRolesQuery } from '../../api/useScriptRolesQuery';
import { useNightStepMutation } from '../../api/useNightStepMutation';
import { useEndNightMutation } from '../../api/useEndNightMutation';
import type { Game, Player, RoleSummary } from '../../types/game.types';
import type { NightStep, StepChoice } from '../../types/night.types';
import { getStepTitle, isOpenStatus } from '../../utils/night.utils';
import { AddStepSheet } from '../AddStepSheet/AddStepSheet';
import { EndNightSheet } from '../EndNightSheet/EndNightSheet';
import { NightStepList } from '../NightStepList/NightStepList';
import { SendInfoSheet } from '../SendInfoSheet/SendInfoSheet';
import { StepChoiceSheet } from '../StepChoiceSheet/StepChoiceSheet';
import { GrimoireAction } from '../GrimoireAction/GrimoireAction';
import styles from './StorytellerNight.module.scss';

interface StorytellerNightProps {
  game: Game;
}

type OpenSheet = 'info' | 'choice' | 'end' | 'add';
type StepAction = 'activate' | 'skip' | 'resolve';
interface Decision {
  decision: 'Accepted' | 'Modified' | 'Ignored';
  choice?: StepChoice;
}

// Choix d'une étape en clair : « Inès », « Marc et Lou », « Moine »
const formatChoice = (step: NightStep, players: Player[], roles: RoleSummary[]) => {
  const pseudo = (id: string | null) => players.find((p) => p.id === id)?.pseudo;
  const names = [pseudo(step.target_id), pseudo(step.second_target_id)].filter(Boolean);
  const role = roles.find((r) => r.id === step.target_role_id)?.name;
  return [names.join(' et '), role].filter(Boolean).join(' · ') || undefined;
};

// Où en est une étape qui retient la nuit
const describeBlocking = (step: NightStep, players: Player[], roles: RoleSummary[]) => {
  if (step.status === 'Received') {
    return `Choix reçu : ${formatChoice(step, players, roles) ?? 'a compris'}`;
  }
  if (step.status === 'Pending') return 'Étape ajoutée, pas encore lancée';
  return 'Réfléchit…';
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

/**
 * Nuit du conteur, automatique : chaque rôle choisit en même temps sur son téléphone, l'app
 * applique les effets, envoie les informations et calcule les morts. Le conteur n'intervient que
 * pour aider un joueur bloqué (choisir à sa place, passer), puis relit les morts et lève le jour.
 */
export const StorytellerNight = ({ game }: StorytellerNightProps) => {
  const navigate = useNavigate();
  const { data: night, isLoading } = useNightQuery(game.id, true);
  const { data: players = [] } = usePlayersQuery(game.id);
  const { data: roles = [] } = useScriptRolesQuery(game.id);
  const { mutateAsync: runStep, isPending: isRunning } = useNightStepMutation();
  const { mutateAsync: endNight, isPending: isEnding } = useEndNightMutation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  // Étape que le conteur traite à la place du joueur
  const [helpedStep, setHelpedStep] = useState<NightStep>();
  const closeSheet = useCallback(() => {
    setOpenSheet(undefined);
    setHelpedStep(undefined);
  }, []);

  const steps = night?.steps ?? [];
  // Ce qui retient la nuit : un joueur qui n'a pas répondu, ou une étape ajoutée par le conteur
  const blocking = steps.filter(
    (s) => s.status === 'WaitingPlayer' || (s.action_type === 'custom' && isOpenStatus(s.status))
  );
  const openSteps = steps.filter((s) => isOpenStatus(s.status)).length;
  const title = `Nuit ${night?.round ?? game.current_round}`;
  const pseudo = (id: string) => players.find((p) => p.id === id)?.pseudo ?? '?';

  const run = async (step: NightStep, action: StepAction, extra?: Decision) => {
    try {
      if (action === 'resolve' && extra) {
        await runStep({ gameId: game.id, stepId: step.id, action, ...extra });
      } else if (action !== 'resolve') {
        await runStep({ gameId: game.id, stepId: step.id, action });
      }
      closeSheet();
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
      actions={
        <>
          <PhaseBarAction aria-label="Envoyer une information" onClick={() => setOpenSheet('info')}>
            <MessageSquare aria-hidden="true" />
          </PhaseBarAction>
          <PhaseBarAction aria-label="Terminer la nuit" onClick={() => setOpenSheet('end')}>
            <Sunrise aria-hidden="true" />
          </PhaseBarAction>
          <GrimoireAction game={game} />
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

  const deaths = night.proposed_deaths;
  const footer = night.resolved ? (
    <Button size="xl" onClick={() => setOpenSheet('end')}>
      Lever le jour
    </Button>
  ) : (
    <Button variant="ghost" onClick={() => setOpenSheet('end')}>
      Lever le jour sans attendre
    </Button>
  );

  return (
    <Screen header={header} footer={footer}>
      <Card tone="accent" className={styles.current}>
        {night.resolved ? (
          <>
            <span className={styles.eyebrow}>Nuit résolue</span>
            <h2 className={styles.title}>
              {deaths.length === 0
                ? 'Personne n’est mort'
                : `${plural(deaths.length, 'mort')} : ${deaths.map(pseudo).join(', ')}`}
            </h2>
            <p className={styles.text}>
              Les informations sont parties. Relisez les morts, puis levez le jour.
            </p>
          </>
        ) : (
          <>
            <span className={styles.eyebrow}>Nuit automatique</span>
            <h2 className={styles.title}>
              {night.waiting_count > 0
                ? `En attente de ${plural(night.waiting_count, 'joueur')}`
                : 'Une étape attend votre décision'}
            </h2>
            <p className={styles.text}>
              Chacun choisit sur son téléphone ; l’app applique les effets et envoie les
              informations dans l’ordre de la nuit. Aidez seulement un joueur bloqué.
            </p>
          </>
        )}
        {night.is_first_night && night.demon_bluffs.length > 0 && (
          <div className={styles.block}>
            <span className={styles.label}>Bluffs du Démon</span>
            <p className={styles.text}>{night.demon_bluffs.map((r) => r.name).join(', ')}</p>
          </div>
        )}
      </Card>

      {blocking.length > 0 && (
        <section className={styles.help} aria-labelledby="night-help">
          <h3 id="night-help" className={styles.label}>
            À débloquer
          </h3>
          {blocking.map((step) => (
            <div key={step.id} className={styles.help_row}>
              <div className={styles.help_text}>
                <span className={styles.help_title}>
                  {getStepTitle(step)}
                  {step.actor && <span className={styles.actor}> · {step.actor.pseudo}</span>}
                </span>
                <small>{describeBlocking(step, players, roles)}</small>
              </div>
              <div className={styles.help_actions}>
                {step.status === 'Pending' && (
                  <Button
                    fullWidth={false}
                    disabled={isRunning}
                    onClick={() => void run(step, 'activate')}
                  >
                    Lancer
                  </Button>
                )}
                {step.status === 'Received' && (
                  <Button
                    fullWidth={false}
                    disabled={isRunning}
                    onClick={() => void run(step, 'resolve', { decision: 'Accepted' })}
                  >
                    Accepter
                  </Button>
                )}
                {step.action_kind !== 'Confirm' && step.status !== 'Pending' && (
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    onClick={() => {
                      setHelpedStep(step);
                      setOpenSheet('choice');
                    }}
                  >
                    {step.status === 'Received' ? 'Modifier' : 'Choisir à sa place'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  fullWidth={false}
                  disabled={isRunning}
                  onClick={() => void run(step, 'skip')}
                >
                  Passer
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      <NightStepList steps={steps} />
      <Button variant="ghost" onClick={() => setOpenSheet('add')}>
        Ajouter une étape
      </Button>

      {openSheet === 'info' && (
        <SendInfoSheet gameId={game.id} players={players} roles={roles} onClose={closeSheet} />
      )}
      {openSheet === 'choice' && helpedStep && (
        <StepChoiceSheet
          step={helpedStep}
          players={players}
          roles={roles}
          originalLabel={
            helpedStep.status === 'Received' ? formatChoice(helpedStep, players, roles) : undefined
          }
          isLoading={isRunning}
          onApply={(choice) => void run(helpedStep, 'resolve', { decision: 'Modified', choice })}
          onClose={closeSheet}
        />
      )}
      {openSheet === 'add' && (
        <AddStepSheet gameId={game.id} players={players} roles={roles} onClose={closeSheet} />
      )}
      {openSheet === 'end' && (
        <EndNightSheet
          players={players}
          openSteps={openSteps}
          proposedDeaths={deaths}
          isLoading={isEnding}
          onConfirm={(selected) => void handleEndNight(selected)}
          onClose={closeSheet}
        />
      )}
    </Screen>
  );
};
