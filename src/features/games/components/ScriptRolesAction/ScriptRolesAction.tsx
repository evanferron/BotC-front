import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PhaseBarAction } from '@common/components/PhaseBar/PhaseBar';
import { useAuth } from '@auth/hooks/useAuth';
import { ScriptRolesSheet } from '@scripts/components/ScriptRolesSheet/ScriptRolesSheet';
import type { RolesInPlay } from '@scripts/types/script.types';
import { useCardsQuery } from '../../api/useCardsQuery';
import { usePlayersQuery } from '../../api/usePlayersQuery';
import type { Game } from '../../types/game.types';

interface ScriptRolesSheetForGameProps {
  game: Game;
  isStoryteller: boolean;
  onClose: () => void;
}

// Les cartes n'existent qu'à partir de la distribution
const hasCards = (game: Game) => game.status !== 'Lobby';

const ScriptRolesSheetForGame = ({
  game,
  isStoryteller,
  onClose,
}: ScriptRolesSheetForGameProps) => {
  const { data: distribution } = useCardsQuery(hasCards(game) ? game.id : undefined);
  const { data: players } = usePlayersQuery(isStoryteller ? game.id : undefined);

  // Variante conteur : rôles réellement en jeu, avec les pseudos de ceux qui les ont.
  // Le rôle réel compte (l'Ivrogne est en jeu, pas le rôle qu'il croit avoir).
  const inPlay = useMemo<RolesInPlay | undefined>(() => {
    if (!isStoryteller || !distribution?.cards.length) return undefined;
    const pseudos = new Map(players?.map((player) => [player.id, player.pseudo]));
    const map: RolesInPlay = new Map();
    for (const card of distribution.cards) {
      if (!card.role) continue;
      const holders = map.get(card.role.id) ?? [];
      const pseudo = card.picked_by ? pseudos.get(card.picked_by) : undefined;
      if (pseudo) holders.push(pseudo);
      map.set(card.role.id, holders);
    }
    return map;
  }, [isStoryteller, distribution, players]);

  return (
    <ScriptRolesSheet
      scriptId={game.script_id}
      // Côté joueur : son rôle tel qu'il le voit, épinglé et masqué
      pinned={isStoryteller ? undefined : distribution?.my_role}
      inPlay={inPlay}
      onClose={onClose}
    />
  );
};

/**
 * Icône « Rôles » du bandeau, présente sur tous les écrans de partie, y compris l'attente de
 * nuit (design/Navigation-Vibrations.dc.html). Ouvre les rôles du script par-dessus l'écran.
 */
export const ScriptRolesAction = ({ game }: { game: Game }) => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <PhaseBarAction aria-label="Rôles du script" onClick={() => setIsOpen(true)}>
        <BookOpen aria-hidden="true" />
      </PhaseBarAction>
      {isOpen && (
        <ScriptRolesSheetForGame
          game={game}
          isStoryteller={game.storyteller_id === userId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
