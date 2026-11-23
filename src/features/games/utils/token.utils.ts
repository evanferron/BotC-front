import { Crosshair, Fish, FlaskConical, Shield, Wine, type LucideIcon } from 'lucide-react';
import type { TokenKind } from '../types/grimoire.types';

interface TokenInfo {
  label: string;
  // Une phrase : ce que le statut veut dire et quand il tombe
  hint: string;
  icon: LucideIcon;
}

// Ordre d'affichage, identique à celui du serveur
export const TOKEN_KINDS: TokenKind[] = ['Poisoned', 'Drunk', 'Protected', 'RedHerring', 'Marked'];

// design/Jetons.dc.html : chaque statut a sa forme propre, aucune couleur dédiée
export const TOKENS: Record<TokenKind, TokenInfo> = {
  Poisoned: {
    label: 'Empoisonné',
    hint: 'Capacité faussée ; la Vierge et le Maire ne s’appliquent pas. Tombe à la nuit suivante.',
    icon: FlaskConical,
  },
  Drunk: {
    label: 'Ivre',
    hint: 'Capacité faussée jusqu’à nouvel ordre ; la Vierge et le Maire ne s’appliquent pas.',
    icon: Wine,
  },
  Protected: {
    label: 'Protégé',
    hint: 'Ne peut pas mourir cette nuit. Tombe à la nuit suivante.',
    icon: Shield,
  },
  RedHerring: {
    label: 'Fausse piste',
    hint: 'Vu comme le Démon par la Diseuse de bonne aventure, toute la partie.',
    icon: Fish,
  },
  Marked: {
    label: 'Marqué',
    hint: 'Rappel libre du conteur.',
    icon: Crosshair,
  },
};

export const sortTokens = (tokens: TokenKind[]) =>
  [...tokens].sort((a, b) => TOKEN_KINDS.indexOf(a) - TOKEN_KINDS.indexOf(b));

export const describeTokens = (tokens: TokenKind[]) =>
  sortTokens(tokens)
    .map((t) => TOKENS[t].label)
    .join(', ');
