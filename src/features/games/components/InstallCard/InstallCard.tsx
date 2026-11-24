import { useState, useSyncExternalStore } from 'react';
import { Download } from 'lucide-react';
import { Card } from '@common/components/Card/Card';
import { Button } from '@common/components/Button/Button';
import {
  canPromptInstall,
  dismissInstall,
  isInstallDismissed,
  isInstalled,
  isIos,
  promptInstall,
  subscribeInstallPrompt,
} from '@common/utils/install.utils';
import styles from './InstallCard.module.scss';

/**
 * Invitation à installer l'appli, en salle d'attente, une seule fois (design/J6 24f). Chrome et
 * Edge ouvrent leur fenêtre d'installation ; sur iPhone, le geste est expliqué. Rien si l'appli est
 * déjà installée ou si le navigateur ne sait pas l'installer.
 */
export const InstallCard = () => {
  const promptable = useSyncExternalStore(subscribeInstallPrompt, canPromptInstall, () => false);
  const [hidden, setHidden] = useState(() => isInstalled() || isInstallDismissed());
  const ios = isIos();
  if (hidden || (!promptable && !ios)) return null;

  const later = () => {
    dismissInstall();
    setHidden(true);
  };
  const install = async () => {
    if (await promptInstall()) setHidden(true);
  };

  return (
    <Card className={styles.card}>
      <span className={styles.title}>
        <Download aria-hidden="true" />
        Installer l'appli
      </span>
      <ul className={styles.list}>
        <li>Plein écran, retour rapide dans la partie.</li>
        <li>Pas de barre d'adresse pendant la nuit.</li>
      </ul>
      {ios && !promptable ? (
        <p className={styles.hint}>
          Sur iPhone : touchez Partager, puis « Sur l'écran d'accueil ».
        </p>
      ) : null}
      <div className={styles.actions}>
        {promptable && (
          <Button fullWidth={false} onClick={() => void install()}>
            Installer
          </Button>
        )}
        <Button variant="ghost" fullWidth={false} onClick={later}>
          {promptable ? 'Plus tard' : 'Compris'}
        </Button>
      </div>
    </Card>
  );
};
