import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@common/components/Button/Button';
import styles from './UpdatePrompt.module.scss';

// Vérifie s'il existe une nouvelle version toutes les heures (appli restée ouverte toute une soirée)
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/**
 * Nouvelle version de l'appli prête : proposée, jamais imposée. Recharger en pleine nuit couperait
 * le joueur ; il choisit son moment (l'état de la partie est sur le serveur, rien n'est perdu).
 */
export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      window.setInterval(() => void registration.update(), UPDATE_CHECK_MS);
    },
  });

  if (!needRefresh) return null;
  return (
    <div className={styles.bar} role="status">
      <span>Nouvelle version disponible.</span>
      <Button fullWidth={false} onClick={() => void updateServiceWorker(true)}>
        Mettre à jour
      </Button>
      <Button variant="ghost" fullWidth={false} onClick={() => setNeedRefresh(false)}>
        Plus tard
      </Button>
    </div>
  );
};
