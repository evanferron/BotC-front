import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { Loading } from '@common/components/Loading/Loading';
import { AUTH_ROUTES, buildScriptRolesRoute } from '@common/config/routes.config';
import { useScriptsQuery } from '@scripts/api/useScriptsQuery';
import styles from './Scripts.module.scss';

// Catalogue des scripts : point d'entrée hors partie vers les rôles de chaque script
export const Scripts = () => {
  const navigate = useNavigate();
  const { data: scripts, isPending, refetch } = useScriptsQuery();

  useEffect(() => {
    document.title = 'Scripts · BotC';
  }, []);

  const renderContent = () => {
    if (scripts) {
      return (
        <ul className={styles.list}>
          {scripts.map((script) => (
            <li key={script.id}>
              <button
                type="button"
                className={styles.row}
                onClick={() => void navigate(buildScriptRolesRoute(script.id))}
              >
                <span className={styles.text}>
                  <span className={styles.name}>{script.name}</span>
                  {script.description && (
                    <span className={styles.description}>{script.description}</span>
                  )}
                </span>
                <ChevronRight aria-hidden="true" className={styles.chevron} />
              </button>
            </li>
          ))}
        </ul>
      );
    }
    if (isPending) return <Loading />;
    return (
      <Card className={styles.error}>
        <p className={styles.description}>Les scripts n'ont pas pu être chargés.</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Réessayer
        </Button>
      </Card>
    );
  };

  return (
    <Screen
      header={
        <PhaseBar
          title="Scripts"
          actions={
            <PhaseBarAction
              aria-label="Retour à mes parties"
              onClick={() => void navigate(AUTH_ROUTES.GAMES)}
            >
              <ArrowLeft aria-hidden="true" />
            </PhaseBarAction>
          }
        />
      }
    >
      <p className={styles.intro}>Choisissez un script pour parcourir ses rôles.</p>
      {renderContent()}
    </Screen>
  );
};
