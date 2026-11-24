import type { TokenKind } from '@games/types/grimoire.types';
import { TOKENS, describeTokens, sortTokens } from '@games/utils/token.utils';
import styles from './TokenBadges.module.scss';

interface TokenBadgesProps {
  tokens: TokenKind[];
  // Au-delà, « +N » (design/Jetons : trois au plus)
  max?: number;
}

// Pastilles de statut du grimoire : un résumé, le détail est dans la fiche de correction
export const TokenBadges = ({ tokens, max = 3 }: TokenBadgesProps) => {
  if (tokens.length === 0) return null;
  const sorted = sortTokens(tokens);
  const shown = sorted.length > max ? sorted.slice(0, max - 1) : sorted;
  const hidden = sorted.length - shown.length;
  return (
    <span className={styles.badges} role="img" aria-label={`Statuts : ${describeTokens(tokens)}`}>
      {shown.map((token) => {
        const Icon = TOKENS[token].icon;
        return (
          <span key={token} className={styles.badge} title={TOKENS[token].label}>
            <Icon aria-hidden="true" />
          </span>
        );
      })}
      {hidden > 0 && <span className={styles.more}>+{hidden}</span>}
    </span>
  );
};
