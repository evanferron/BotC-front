import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { PlayerDisc } from '@common/components/PlayerDisc/PlayerDisc';
import { cx } from '@common/utils/className.utils';
import type { GrimoirePlayer } from '../../types/grimoire.types';
import styles from './SeatOrderList.module.scss';

interface SeatOrderListProps {
  // Ordre actuel de la table
  players: GrimoirePlayer[];
  isSaving: boolean;
  onSave: (playerIds: string[]) => void;
  onCancel: () => void;
}

const SeatRow = ({ player, seat }: { player: GrimoirePlayer; seat: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  return (
    <li
      ref={setNodeRef}
      className={cx(styles.row, isDragging && styles.dragging)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.handle}
        aria-label={`Déplacer ${player.pseudo}, place ${seat}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" />
      </button>
      <span className={styles.seat} aria-hidden="true">
        {seat}
      </span>
      <PlayerDisc name={player.pseudo} size="small" dead={!player.is_alive} />
      <span className={styles.text}>
        <span className={styles.name}>{player.pseudo}</span>
        <small>{player.role?.name ?? 'Sans rôle'}</small>
      </span>
    </li>
  );
};

/**
 * Grimoire, réorganiser (design/C7 écran 14) : le conteur fait glisser les joueurs pour reproduire
 * l'ordre réel autour de la table. Rien n'est envoyé avant « Terminé ».
 */
export const SeatOrderList = ({ players, isSaving, onSave, onCancel }: SeatOrderListProps) => {
  const [order, setOrder] = useState(() => players.map((p) => p.id));
  const byId = new Map(players.map((p) => [p.id, p]));
  const sensors = useSensors(
    // Quelques pixels avant de saisir : un appui seul ne déplace rien
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const isUnchanged = order.every((id, index) => id === players[index]?.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((current) =>
      arrayMove(current, current.indexOf(String(active.id)), current.indexOf(String(over.id)))
    );
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>
        Faites glisser pour reproduire l’ordre réel autour de la table, dans le sens des aiguilles
        d’une montre.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              'Espace pour saisir le joueur, flèches pour le déplacer, Espace pour le poser, Échap pour annuler.',
          },
        }}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className={styles.list} aria-label="Ordre de la table">
            {order.map((id, index) => {
              const player = byId.get(id);
              return player && <SeatRow key={id} player={player} seat={index + 1} />;
            })}
          </ol>
        </SortableContext>
      </DndContext>
      <div className={styles.actions}>
        <Button isLoading={isSaving} disabled={isUnchanged} onClick={() => onSave(order)}>
          Terminé
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
};
