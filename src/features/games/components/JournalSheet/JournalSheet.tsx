import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Button } from '@common/components/Button/Button';
import { Card } from '@common/components/Card/Card';
import { ConfirmSheet } from '@common/components/ConfirmSheet/ConfirmSheet';
import { FullScreenSheet } from '@common/components/FullScreenSheet/FullScreenSheet';
import { Loading } from '@common/components/Loading/Loading';
import { Segmented } from '@common/components/Segmented/Segmented';
import { showSuccess } from '@common/utils/toast.utils';
import { cx } from '@common/utils/className.utils';
import { useJournalQuery } from '../../api/useJournalQuery';
import { useUndoMutation } from '../../api/useUndoMutation';
import type { Game } from '../../types/game.types';
import type { JournalCategory, JournalEntry } from '../../types/journal.types';
import styles from './JournalSheet.module.scss';

type Filter = 'all' | 'night' | 'day' | 'corrections';

const FILTERS = [
  { value: 'all' as const, label: 'Tout' },
  { value: 'night' as const, label: 'Nuit' },
  { value: 'day' as const, label: 'Jour' },
  { value: 'corrections' as const, label: 'Corrections' },
];

const MATCHES: Record<Filter, (category: JournalCategory) => boolean> = {
  all: () => true,
  night: (c) => c === 'Night',
  day: (c) => c === 'Day',
  corrections: (c) => c === 'Correction',
};

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const Entry = ({ entry }: { entry: JournalEntry }) => (
  <li className={cx(styles.entry, entry.undone && styles.undone)}>
    <span className={styles.meta}>
      {time(entry.at)}
      {entry.phase && ` · ${entry.phase}`}
      {entry.undone && ' · annulé'}
    </span>
    <span className={styles.title}>{entry.title}</span>
    {entry.detail && <span className={styles.detail}>{entry.detail}</span>}
  </li>
);

interface JournalSheetProps {
  game: Game;
  onClose: () => void;
}

/**
 * Journal du conteur (design/C7 23a et 23b) : tout ce qui s'est passé, secret compris (choix de
 * nuit, informations reçues, statuts posés, attaques bloquées), et l'annulation de sa dernière
 * action. Annuler remet la partie dans l'état d'avant, réponses des joueurs comprises.
 */
export const JournalSheet = ({ game, onClose }: JournalSheetProps) => {
  const { data: journal, isLoading } = useJournalQuery(game.id);
  const { mutateAsync: undo, isPending: isUndoing } = useUndoMutation();
  const [filter, setFilter] = useState<Filter>('all');
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmUndo = async () => {
    try {
      const { label } = await undo(game.id);
      showSuccess(`Annulé : ${label}`);
    } catch {
      // Toast affiché par la mutation
    } finally {
      setIsConfirming(false);
    }
  };

  const entries = journal?.entries.filter((e) => MATCHES[filter](e.category)) ?? [];

  return (
    <FullScreenSheet title="Journal" closeLabel="Fermer le journal" onClose={onClose}>
      {journal?.undo && (
        <Card className={styles.undo}>
          <span className={styles.meta}>Dernière action · {time(journal.undo.at)}</span>
          <span className={styles.title}>{journal.undo.label}</span>
          <Button
            variant="secondary"
            leadingIcon={<Undo2 aria-hidden="true" />}
            onClick={() => setIsConfirming(true)}
          >
            Annuler cette action
          </Button>
        </Card>
      )}
      <Segmented label="Afficher" options={FILTERS} value={filter} onChange={setFilter} />
      {isLoading || !journal ? (
        <Loading label="Lecture du journal…" />
      ) : (
        <ol className={styles.list} aria-label="Journal, du plus récent au plus ancien">
          {entries.map((entry) => (
            <Entry key={entry.seq} entry={entry} />
          ))}
          {entries.length === 0 && <li className={styles.empty}>Rien pour l’instant.</li>}
        </ol>
      )}
      <ConfirmSheet
        open={isConfirming}
        title={`Annuler « ${journal?.undo?.label ?? ''} » ?`}
        description="La partie revient à l’état d’avant cette action, réponses des joueurs comprises. Les joueurs voient l’état mis à jour ; l’annulation est inscrite au journal."
        confirmLabel="Annuler l’action"
        cancelLabel="Garder l’action"
        tone="primary"
        isLoading={isUndoing}
        onConfirm={() => void confirmUndo()}
        onCancel={() => setIsConfirming(false)}
      />
    </FullScreenSheet>
  );
};
