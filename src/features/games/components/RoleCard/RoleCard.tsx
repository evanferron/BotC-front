import { useState } from 'react';
import { Compass, Eye, Flame, Moon, Shield, Skull, TriangleAlert } from 'lucide-react';
import { cx } from '@/utils/className.utils';
import type { CharacterType, RoleSummary } from '../../types/game.types';
import { getCharacterTypeLabel, isEvilType } from '../../utils/role.utils';
import styles from './RoleCard.module.scss';

interface RoleCardProps {
  role: RoleSummary;
  // Carte masquée : le rôle n'apparaît que tant que le doigt reste posé (écrans 08a/08b)
  masked?: boolean;
  // Appelé la première fois que le joueur révèle sa carte
  onReveal?: () => void;
}

const TYPE_ICONS: Record<CharacterType, typeof Shield> = {
  Townsfolk: Shield,
  Outsider: Compass,
  Minion: Skull,
  Demon: Flame,
};

const RoleFace = ({ role }: { role: RoleSummary }) => {
  const evil = isEvilType(role.character_type);
  const Icon = TYPE_ICONS[role.character_type];
  return (
    <div className={styles.face}>
      <div className={styles.team}>
        {evil ? <TriangleAlert aria-hidden="true" /> : <Moon aria-hidden="true" />}
        {evil ? 'Mauvaise équipe' : 'Bonne équipe'}
      </div>
      <div className={styles.medal}>
        <Icon aria-hidden="true" />
      </div>
      <div className={styles.name}>{role.name}</div>
      <span className={styles.type}>{getCharacterTypeLabel(role.character_type)}</span>
      <div className={styles.divider} />
      {role.ability_description && <p className={styles.ability}>{role.ability_description}</p>}
    </div>
  );
};

// Carte de rôle du design system (design/Carte-de-role.dc.html)
export const RoleCard = ({ role, masked = false, onReveal }: RoleCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const evil = isEvilType(role.character_type);
  const label = `${role.name}, ${evil ? 'mauvaise' : 'bonne'} équipe`;

  if (!masked) {
    return (
      <div
        className={cx(styles.card, evil ? styles.evil : styles.good)}
        role="img"
        aria-label={label}
      >
        <Frame />
        <RoleFace role={role} />
      </div>
    );
  }

  const show = () => {
    setRevealed(true);
    onReveal?.();
  };
  const hide = () => setRevealed(false);

  return (
    <button
      type="button"
      className={cx(styles.card, styles.mask, revealed && (evil ? styles.evil : styles.good))}
      aria-label={revealed ? label : 'Carte masquée. Maintenir appuyé pour révéler votre rôle.'}
      onPointerDown={show}
      onPointerUp={hide}
      onPointerLeave={hide}
      onPointerCancel={hide}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          show();
        }
      }}
      onKeyUp={hide}
      onBlur={hide}
      onContextMenu={(event) => event.preventDefault()}
    >
      <Frame />
      {revealed ? (
        <RoleFace role={role} />
      ) : (
        <span className={styles.veil}>
          <span className={styles.eye}>
            <Eye aria-hidden="true" />
          </span>
          <span className={styles.veil_title}>Maintenir pour révéler</span>
          <span className={styles.veil_text}>Relâchez pour masquer</span>
        </span>
      )}
    </button>
  );
};

// Filet intérieur et coins laiton
const Frame = () => (
  <>
    <i className={styles.inner} aria-hidden="true" />
    <i className={cx(styles.corner, styles.tl)} aria-hidden="true" />
    <i className={cx(styles.corner, styles.tr)} aria-hidden="true" />
    <i className={cx(styles.corner, styles.bl)} aria-hidden="true" />
    <i className={cx(styles.corner, styles.br)} aria-hidden="true" />
  </>
);
