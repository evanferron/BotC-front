import { Copy, Share } from 'lucide-react';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { buildJoinUrl } from '@/config/routes.config';
import { showError, showSuccess } from '@/services/toast.service';
import styles from './RoomCodeCard.module.scss';

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

interface RoomCodeCardProps {
  roomCode: string;
}

// Code de la partie à transmettre aux joueurs : copie du code ou partage d'un lien direct
export const RoomCodeCard = ({ roomCode }: RoomCodeCardProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      showSuccess('Code copié', { id: 'code-copied' });
    } catch {
      showError('Impossible de copier le code');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Rejoindre la table',
        text: `Code de la partie : ${roomCode}`,
        url: buildJoinUrl(roomCode),
      });
    } catch {
      // Partage annulé par l'utilisateur : rien à signaler
    }
  };

  return (
    <Card className={styles.card}>
      <span className={styles.eyebrow} id="room-code-label">
        Code de la partie
      </span>
      <p className={styles.code} aria-labelledby="room-code-label">
        {roomCode}
      </p>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          leadingIcon={<Copy aria-hidden="true" />}
          onClick={() => void handleCopy()}
        >
          Copier
        </Button>
        {canShare && (
          <Button
            variant="secondary"
            leadingIcon={<Share aria-hidden="true" />}
            onClick={() => void handleShare()}
          >
            Partager
          </Button>
        )}
      </div>
    </Card>
  );
};
