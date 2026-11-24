import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import styles from './ConnectionBanner.module.scss';

// Délai avant d'afficher une coupure : un téléphone qui se rallume se reconnecte en une seconde
const GRACE_MS = 4000;

// `true` seulement si `active` le reste au moins `delayMs`
const useLasting = (active: boolean, delayMs: number) => {
  const [lasting, setLasting] = useState(false);
  useEffect(() => {
    if (!active) {
      setLasting(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setLasting(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);
  return lasting && active;
};

interface ConnectionBannerProps {
  // Le temps réel de la partie est coupé (ce téléphone)
  offline: boolean;
  // Le conteur n'a plus d'écran ouvert (côté joueur)
  storytellerAway: boolean;
}

/**
 * Bandeau de connexion (design/J6 24b et 24e), discret et non bloquant : la partie reste jouable,
 * le bandeau dit seulement pourquoi rien ne bouge. Hors ligne prime sur conteur absent.
 */
export const ConnectionBanner = ({ offline, storytellerAway }: ConnectionBannerProps) => {
  const showOffline = useLasting(offline, GRACE_MS);
  const showAway = useLasting(storytellerAway && !offline, GRACE_MS);
  if (!showOffline && !showAway) return null;

  return (
    <div className={styles.banner} role="status">
      <WifiOff aria-hidden="true" />
      <span>
        {showOffline ? (
          <>
            <strong>Hors ligne.</strong> Reconnexion automatique…
          </>
        ) : (
          <>
            <strong>Le Conteur est déconnecté.</strong> Rien n'est perdu, restez à table.
          </>
        )}
      </span>
    </div>
  );
};
