import { useNavigate } from 'react-router-dom';
import { Screen } from '@common/components/Screen/Screen';
import { PhaseBar } from '@common/components/PhaseBar/PhaseBar';
import { Button } from '@common/components/Button/Button';
import { Dial } from '@common/components/Dial/Dial';
import { AUTH_ROUTES } from '@common/config/routes.config';
import styles from './NotFound.module.scss';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Screen
      header={<PhaseBar title="Page introuvable" />}
      centered
      footer={
        <Button size="xl" onClick={() => void navigate(AUTH_ROUTES.GAMES, { replace: true })}>
          Retour à mes parties
        </Button>
      }
    >
      <Dial size="xl" angle={90} />
      <h2 className={styles.title}>Ce chemin ne mène à aucune table.</h2>
    </Screen>
  );
};
