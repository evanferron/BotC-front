import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PhaseBar, PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import type { PinnedRole, RolesInPlay } from '../../types/script.types';
import { ScriptRoles } from '../ScriptRoles/ScriptRoles';
import styles from './ScriptRolesSheet.module.scss';

interface ScriptRolesSheetProps {
  scriptId: string;
  pinned?: PinnedRole | null;
  inPlay?: RolesInPlay;
  onClose: () => void;
}

/**
 * Feuille plein écran « Rôles du script », ouverte depuis l'icône « Rôles » du bandeau
 * (design/Navigation-Vibrations.dc.html). Elle se pose par-dessus l'écran courant sans le
 * modifier, même pendant l'attente de nuit (écran R8).
 */
export const ScriptRolesSheet = ({ scriptId, pinned, inPlay, onClose }: ScriptRolesSheetProps) => {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Une fiche de rôle ouverte par-dessus intercepte Échap (Sheet, phase de capture)
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={styles.panel}>
        <PhaseBar
          title="Rôles du script"
          titleId={titleId}
          // Bandeau neutre (fond de base, filet plein), comme sur la maquette R1
          variant="night"
          actions={
            <PhaseBarAction aria-label="Fermer la liste des rôles" onClick={onClose}>
              <X aria-hidden="true" />
            </PhaseBarAction>
          }
        />
        <div className={styles.body}>
          <ScriptRoles scriptId={scriptId} pinned={pinned} inPlay={inPlay} />
        </div>
      </div>
    </div>,
    document.body
  );
};
