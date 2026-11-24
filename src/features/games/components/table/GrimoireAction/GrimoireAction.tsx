import { useState } from 'react';
import { BookUser } from 'lucide-react';
import { PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import type { Game } from '@games/types/game.types';
import { GrimoireSheet } from '../GrimoireSheet/GrimoireSheet';

/**
 * Icône « Grimoire » du bandeau conteur, à un appui à tout moment de la partie
 * (design/Correction.dc.html, règle 1). Ouvre le grimoire par-dessus l'écran courant.
 */
export const GrimoireAction = ({ game }: { game: Game }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <PhaseBarAction aria-label="Grimoire" onClick={() => setIsOpen(true)}>
        <BookUser aria-hidden="true" />
      </PhaseBarAction>
      {isOpen && <GrimoireSheet game={game} onClose={() => setIsOpen(false)} />}
    </>
  );
};
