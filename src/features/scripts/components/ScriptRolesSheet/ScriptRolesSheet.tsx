import { FullScreenSheet } from '@common/components/FullScreenSheet/FullScreenSheet';
import type { PinnedRole, RolesInPlay } from '../../types/script.types';
import { ScriptRoles } from '../ScriptRoles/ScriptRoles';

interface ScriptRolesSheetProps {
  scriptId: string;
  pinned?: PinnedRole | null;
  inPlay?: RolesInPlay;
  onClose: () => void;
}

/**
 * Feuille plein écran « Rôles du script », ouverte depuis l'icône « Rôles » du bandeau.
 * Elle se pose par-dessus l'écran courant sans le modifier, même pendant l'attente de nuit (R8).
 */
export const ScriptRolesSheet = ({ scriptId, pinned, inPlay, onClose }: ScriptRolesSheetProps) => (
  <FullScreenSheet title="Rôles du script" closeLabel="Fermer la liste des rôles" onClose={onClose}>
    <ScriptRoles scriptId={scriptId} pinned={pinned} inPlay={inPlay} />
  </FullScreenSheet>
);
