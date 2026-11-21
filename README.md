# BotC-front

PWA compagnon de **Blood on the Clocktower** (React 19 · Vite · TanStack Query · SCSS modules).
L'API est dans le dépôt `BotC-back`.

## Architecture

```
src/
├── main.tsx      point d'entrée : branche l'authentification sur le client HTTP, monte l'app
├── app/          assemblage : router, layouts (AuthLayout, PublicLayout), client TanStack Query
├── pages/        écrans routés, minces : ils composent les features
├── features/
│   ├── auth/     session, connexion, profil
│   ├── scripts/  catalogue : scripts, rôles et leur vocabulaire (types, équipes, libellés, icônes)
│   └── games/    parties : lobby, distribution, nuit, jour
└── common/       partagé, sans aucune notion de jeu
    ├── api/        client HTTP (http.ts), erreurs de l'API (errors.ts), durées de cache (query.ts)
    ├── components/ design system « Cadran » (design/)
    ├── config/     variables d'environnement, routes
    ├── hooks/
    ├── styles/     tokens SCSS, injectés dans chaque module par vite.config.ts
    └── utils/
```

### Règles de dépendance

Même principe que `src/common` du back : une couche n'importe que les couches en dessous d'elle.

- `app → pages → features → common`. **`common` n'importe jamais une feature** : ce qu'une feature
  doit lui fournir passe par une fonction de configuration appelée depuis `main.tsx`
  (ex. `configureHttpAuth(httpAuth)`).
- Entre features, un seul sens : `auth ← scripts ← games`.
- Le vocabulaire métier partagé (rôles, équipes) vit dans la feature qui le possède (`scripts`),
  pas dans `common`.
- Les routes sont dans `common/config` : les features naviguent sans dépendre de `app/`.

Ces règles sont vérifiées par ESLint (`no-restricted-imports`, section « Couches » de
`eslint.config.js`) : `npm run lint` échoue sur un import qui remonte les couches.

### Imports

Un alias par couche : `@app`, `@pages`, `@auth`, `@scripts`, `@games`, `@common`. Il n'y a pas
d'alias global : chaque import montre la couche qu'il vise. À l'intérieur d'une même zone (une
feature, un dossier de `common`), les imports sont relatifs ; un import relatif qui remonte de
trois niveaux est refusé par le lint.

### Erreurs de l'API

L'API répond au format RFC 9457 avec un `code` stable (`ErrorCode` dans `common/api/errors.ts`, à
garder aligné avec `error_codes!` du back). Le front teste le code (`getErrorCode`), jamais le
message, qui reste en anglais et peut changer.

## Commandes

```bash
npm run dev         # Vite sur :5173, /api relayé vers l'API sur :8080
npm run build       # tsc + build de production
npm run validate    # lint + vérification des types
npm run format      # Prettier
```
