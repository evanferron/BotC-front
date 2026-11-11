import { useState } from 'react';
import { Sheet } from '@/components/Sheet/Sheet';
import { Button } from '@/components/Button/Button';
import { ChoiceRow } from '@/components/ChoiceRow/ChoiceRow';
import { useSendMessageMutation } from '../../api/useSendMessageMutation';
import type { Player, RoleSummary } from '../../types/game.types';
import type { SendMessagePayload } from '../../types/night.types';
import { PlayerPicker } from '../PlayerPicker/PlayerPicker';
import { RolePicker } from '../RolePicker/RolePicker';
import styles from './SendInfoSheet.module.scss';

type InfoKind = 'Text' | 'Players' | 'Roles' | 'YesNo' | 'Number';

const KINDS: { kind: InfoKind; label: string }[] = [
  { kind: 'Players', label: 'Joueurs' },
  { kind: 'Roles', label: 'Rôles' },
  { kind: 'Number', label: 'Nombre' },
  { kind: 'YesNo', label: 'Oui / non' },
  { kind: 'Text', label: 'Texte' },
];

const MAX_CONTENT = 140;

interface SendInfoSheetProps {
  gameId: string;
  players: Player[];
  roles: RoleSummary[];
  // Destinataire proposé (le joueur réveillé)
  defaultRecipientId?: string;
  // Étape à laquelle l'information répond
  stepId?: string;
  onClose: () => void;
}

// Écran 10b : information privée envoyée à un joueur (joueurs, rôles, nombre, oui/non ou texte)
export const SendInfoSheet = ({
  gameId,
  players,
  roles,
  defaultRecipientId,
  stepId,
  onClose,
}: SendInfoSheetProps) => {
  const { mutateAsync: sendMessage, isPending } = useSendMessageMutation();
  const [recipientId, setRecipientId] = useState(defaultRecipientId ? [defaultRecipientId] : []);
  const [kind, setKind] = useState<InfoKind>('Players');
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [number, setNumber] = useState(0);
  const [answer, setAnswer] = useState<boolean>();
  const [content, setContent] = useState('');

  const recipient = players.find((p) => p.id === recipientId[0]);
  const trimmed = content.trim();
  const isValid =
    !!recipient &&
    {
      Text: trimmed.length > 0,
      Players: playerIds.length > 0,
      Roles: roleIds.length > 0,
      Number: true,
      YesNo: answer !== undefined,
    }[kind];

  const handleSend = async () => {
    if (!recipient) return;
    const message: SendMessagePayload = {
      kind,
      content: trimmed || undefined,
      night_action_id: stepId,
      ...(kind === 'Players' && { player_ids: playerIds }),
      ...(kind === 'Roles' && { role_ids: roleIds }),
      ...(kind === 'Number' && { number }),
      ...(kind === 'YesNo' && { answer }),
    };
    try {
      await sendMessage({ gameId, playerId: recipient.id, pseudo: recipient.pseudo, message });
      onClose();
    } catch {
      // Toast affiché par la mutation
    }
  };

  return (
    <Sheet
      open
      title="Envoyer une information"
      description="Elle s'affichera sur son écran, sans son ni vibration."
      onClose={onClose}
      footer={
        <>
          <Button disabled={!isValid} isLoading={isPending} onClick={() => void handleSend()}>
            {recipient ? `Envoyer à ${recipient.pseudo}` : 'Envoyer'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <span className={styles.label}>Destinataire</span>
      <PlayerPicker
        players={players}
        selected={recipientId}
        max={1}
        onChange={setRecipientId}
        label="Destinataire"
      />

      <span className={styles.label}>Ce que vous montrez</span>
      <div className={styles.kinds} role="radiogroup" aria-label="Type d'information">
        {KINDS.map((option) => (
          <button
            key={option.kind}
            type="button"
            role="radio"
            aria-checked={kind === option.kind}
            className={styles.kind}
            onClick={() => setKind(option.kind)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {kind === 'Players' && (
        <PlayerPicker
          players={players}
          selected={playerIds}
          max={players.length}
          onChange={setPlayerIds}
          label="Joueurs montrés"
        />
      )}
      {kind === 'Roles' && (
        <RolePicker
          roles={roles}
          selected={roleIds}
          max={roles.length}
          onChange={setRoleIds}
          label="Rôles montrés"
        />
      )}
      {kind === 'Number' && (
        <div className={styles.stepper}>
          <Button
            variant="secondary"
            aria-label="Moins"
            disabled={number <= 0}
            onClick={() => setNumber((n) => Math.max(0, n - 1))}
          >
            −
          </Button>
          <span className={styles.number} aria-live="polite">
            {number}
          </span>
          <Button variant="secondary" aria-label="Plus" onClick={() => setNumber((n) => n + 1)}>
            +
          </Button>
        </div>
      )}
      {kind === 'YesNo' && (
        <div role="radiogroup" aria-label="Réponse" className={styles.answers}>
          <ChoiceRow title="Oui" selected={answer === true} onClick={() => setAnswer(true)} />
          <ChoiceRow title="Non" selected={answer === false} onClick={() => setAnswer(false)} />
        </div>
      )}

      <label className={styles.label} htmlFor="info-content">
        <span>{kind === 'Text' ? 'Message' : 'Message (facultatif)'}</span>
        <span className={styles.count}>
          {content.length}/{MAX_CONTENT}
        </span>
      </label>
      <textarea
        id="info-content"
        className={styles.textarea}
        maxLength={MAX_CONTENT}
        rows={3}
        value={content}
        placeholder="Vous apprenez que…"
        onChange={(e) => setContent(e.target.value)}
      />
    </Sheet>
  );
};
