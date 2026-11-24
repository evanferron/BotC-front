import { useState } from 'react';
import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { Segmented } from '@common/components/Segmented/Segmented';
import { HoldButton } from '@common/components/HoldButton/HoldButton';
import { CHARACTER_TYPES, getTeamLabel } from '@scripts/utils/role.utils';
import type { Alignment, RoleSummary } from '../../types/game.types';
import type { GrimoirePlayer, PlayerStateCorrection, TokenKind } from '../../types/grimoire.types';
import { TOKENS, TOKEN_KINDS, sortTokens } from '../../utils/token.utils';
import { RolePicker } from '../RolePicker/RolePicker';
import styles from './CorrectionSheet.module.scss';

const NOTE_MAX = 500;

interface CorrectionSheetProps {
  player: GrimoirePlayer;
  roles: RoleSummary[];
  isLoading: boolean;
  onApply: (correction: PlayerStateCorrection) => void;
  // Exclure le joueur de la table (absent : exclusion impossible)
  onKick?: () => void;
  isKicking?: boolean;
  onClose: () => void;
}

type RoleKey = 'role' | 'shown' | 'registered';

interface RoleFieldProps {
  label: string;
  hint: string;
  roles: RoleSummary[];
  value: string | null;
  // Libellé quand aucun rôle n'est choisi (« Identique au rôle réel »)
  emptyLabel?: string;
  open: boolean;
  onToggle: () => void;
  onChange: (roleId: string | null) => void;
}

const RoleField = ({
  label,
  hint,
  roles,
  value,
  emptyLabel,
  open,
  onToggle,
  onChange,
}: RoleFieldProps) => {
  const current = roles.find((r) => r.id === value);
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.role_row}>
        <span className={styles.role_value}>{current?.name ?? emptyLabel ?? '—'}</span>
        {emptyLabel && value && (
          <Button variant="ghost" fullWidth={false} onClick={() => onChange(null)}>
            Retirer
          </Button>
        )}
        <Button variant="secondary" fullWidth={false} onClick={onToggle}>
          {open ? 'Fermer' : 'Changer'}
        </Button>
      </div>
      <small className={styles.hint}>{hint}</small>
      {open && (
        <RolePicker
          roles={roles}
          selected={value ? [value] : []}
          max={1}
          label={label}
          onChange={([id]) => {
            onChange(id ?? null);
            onToggle();
          }}
        />
      )}
    </div>
  );
};

/**
 * Fiche de correction d'un joueur (design/C4-Grimoire 13c, design/Correction.dc.html) :
 * vie, vote fantôme, statuts, rôle, rôle affiché, rôle de façade, équipe et note. Rien ne s'applique
 * avant « Appliquer » ; seuls les champs modifiés sont envoyés. Le joueur ne reçoit aucune alerte.
 */
export const CorrectionSheet = ({
  player,
  roles,
  isLoading,
  onApply,
  onKick,
  isKicking = false,
  onClose,
}: CorrectionSheetProps) => {
  const [isAlive, setIsAlive] = useState(player.is_alive);
  const [hasGhostVote, setHasGhostVote] = useState(player.has_ghost_vote);
  const [roleId, setRoleId] = useState(player.role?.id ?? null);
  const [shownRoleId, setShownRoleId] = useState(player.shown_role?.id ?? null);
  const [registeredRoleId, setRegisteredRoleId] = useState(player.registered_role?.id ?? null);
  const [alignment, setAlignment] = useState<Alignment>(player.alignment ?? 'Good');
  const [note, setNote] = useState(player.note ?? '');
  const [tokens, setTokens] = useState<TokenKind[]>(player.tokens);
  const [openPicker, setOpenPicker] = useState<RoleKey>();

  const correction: PlayerStateCorrection = {};
  if (isAlive !== player.is_alive) correction.is_alive = isAlive;
  if (hasGhostVote !== player.has_ghost_vote) correction.has_ghost_vote = hasGhostVote;
  if (roleId && roleId !== (player.role?.id ?? null)) correction.role_id = roleId;
  if (shownRoleId !== (player.shown_role?.id ?? null)) correction.shown_role_id = shownRoleId;
  if (registeredRoleId !== (player.registered_role?.id ?? null)) {
    correction.registered_role_id = registeredRoleId;
  }
  if (alignment !== player.alignment) correction.alignment = alignment;
  if (note.trim() !== (player.note ?? '')) correction.note = note.trim() || null;
  if (sortTokens(tokens).join() !== sortTokens(player.tokens).join()) correction.tokens = tokens;
  const changes = Object.keys(correction).length;

  // Rôles rangés comme sur la feuille de script : par type, puis par nom
  const sortedRoles = [...roles].sort(
    (a, b) =>
      CHARACTER_TYPES.indexOf(a.character_type) - CHARACTER_TYPES.indexOf(b.character_type) ||
      a.name.localeCompare(b.name, 'fr')
  );
  const toggle = (key: RoleKey) => setOpenPicker((open) => (open === key ? undefined : key));

  return (
    <Sheet
      open
      title={`Corriger ${player.pseudo}`}
      description="Chaque correction est notée au journal. Le joueur ne reçoit aucune alerte."
      onClose={onClose}
      footer={
        <>
          <Button
            disabled={changes === 0}
            isLoading={isLoading}
            onClick={() => onApply(correction)}
          >
            {changes === 0
              ? 'Appliquer'
              : `Appliquer · ${changes} changement${changes > 1 ? 's' : ''}`}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <Segmented
        label="Vie"
        value={isAlive ? 'alive' : 'dead'}
        onChange={(value) => setIsAlive(value === 'alive')}
        options={[
          { value: 'alive', label: 'En vie' },
          { value: 'dead', label: 'Mort' },
        ]}
      />
      <Segmented
        label="Vote fantôme"
        value={hasGhostVote ? 'yes' : 'no'}
        onChange={(value) => setHasGhostVote(value === 'yes')}
        options={[
          { value: 'yes', label: 'Disponible' },
          { value: 'no', label: 'Utilisé' },
        ]}
        hint="Le vote fantôme ne sert qu'à un joueur mort."
      />
      <div className={styles.field}>
        <span className={styles.label} id="correction-tokens">
          Statuts
        </span>
        <div className={styles.tokens} role="group" aria-labelledby="correction-tokens">
          {TOKEN_KINDS.map((kind) => {
            const { label, hint, icon: Icon } = TOKENS[kind];
            const isOn = tokens.includes(kind);
            return (
              <button
                key={kind}
                type="button"
                className={styles.token}
                aria-pressed={isOn}
                title={hint}
                onClick={() =>
                  setTokens((current) =>
                    isOn ? current.filter((t) => t !== kind) : [...current, kind]
                  )
                }
              >
                <Icon aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <small className={styles.hint}>
          Visibles par vous seul. Empoisonné et Ivre neutralisent la Vierge et le Maire ; le poison
          et la protection tombent à la nuit suivante.
        </small>
      </div>
      <RoleField
        label="Rôle réel"
        hint="Le rôle qui compte pour l'ordre de nuit et les capacités."
        roles={sortedRoles}
        value={roleId}
        open={openPicker === 'role'}
        onToggle={() => toggle('role')}
        onChange={(id) => id && setRoleId(id)}
      />
      <RoleField
        label="Croit être"
        hint="Le rôle que le joueur voit, s'il diffère (l'Ivrogne)."
        roles={sortedRoles}
        value={shownRoleId}
        emptyLabel="Son rôle réel"
        open={openPicker === 'shown'}
        onToggle={() => toggle('shown')}
        onChange={setShownRoleId}
      />
      <RoleField
        label="Perçu comme"
        hint="Rôle de façade pour les capacités : l'Espion qui passe pour un Villageois, le Reclus pour un Sbire."
        roles={sortedRoles}
        value={registeredRoleId}
        emptyLabel="Son rôle réel"
        open={openPicker === 'registered'}
        onToggle={() => toggle('registered')}
        onChange={setRegisteredRoleId}
      />
      <Segmented
        label="Équipe"
        value={alignment}
        onChange={setAlignment}
        options={[
          { value: 'Good', label: getTeamLabel('Good') },
          { value: 'Evil', label: getTeamLabel('Evil') },
        ]}
        hint="Indépendante du rôle : changer de rôle ne change pas l'équipe."
      />
      <label className={styles.field}>
        <span className={styles.label}>Note privée</span>
        <textarea
          className={styles.note}
          value={note}
          maxLength={NOTE_MAX}
          rows={3}
          placeholder="Visible par vous seul"
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      {onKick && (
        <div className={styles.kick}>
          <HoldButton isLoading={isKicking} onConfirm={onKick}>
            Maintenir pour exclure {player.pseudo}
          </HoldButton>
          <small className={styles.kick_hint}>
            Il quitte la table. Son rôle reste dans le grimoire et vous agissez pour lui.
          </small>
        </div>
      )}
    </Sheet>
  );
};
