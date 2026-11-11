import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar } from '@/components/PhaseBar/PhaseBar';
import { TextField } from '@/components/TextField/TextField';
import { Button } from '@/components/Button/Button';
import { PUBLIC_ROUTES } from '@/config/routes.config';
import { getErrorStatus } from '@/utils/api.utils';
import { useLoginMutation } from '@auth/api/useLoginMutation';
import { AUTH_ERROR_MESSAGES, getCommonAuthError } from '@auth/utils/authError.utils';
import styles from './Login.module.scss';

// Écran 01a de la maquette (C1-Creation) : le compte se fait au pseudo, pas à l'e-mail
export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: loginRequest, isPending } = useLoginMutation();

  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    document.title = 'Connexion · BotC';
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const cleanedPseudo = pseudo.trim();
    if (!cleanedPseudo || !password) {
      setError('Renseignez votre pseudo et votre mot de passe.');
      return;
    }

    try {
      // La redirection est faite par PublicLayout dès que la session existe
      await loginRequest({ pseudo: cleanedPseudo, password });
    } catch (err) {
      const status = getErrorStatus(err);
      setError(
        status === 401 || status === 400
          ? AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
          : getCommonAuthError(err)
      );
    }
  };

  return (
    <Screen
      header={<PhaseBar title="Connexion" />}
      onSubmit={handleSubmit}
      bodyClassName={styles.body}
      footer={
        <>
          <Button type="submit" size="xl" isLoading={isPending}>
            Se connecter
          </Button>
          <Button
            variant="secondary"
            onClick={() => void navigate(PUBLIC_ROUTES.REGISTER, { state: location.state })}
          >
            Créer un compte
          </Button>
        </>
      }
    >
      <div className={styles.intro}>
        <span className={styles.eyebrow}>Blood on the Clocktower</span>
        <h2 className={styles.title}>Bon retour à la table.</h2>
        <p className={styles.text}>Un compte est nécessaire pour créer ou rejoindre une partie.</p>
      </div>
      <TextField
        id="login-pseudo"
        label="Pseudo"
        placeholder="Votre pseudo"
        autoComplete="username"
        autoCapitalize="none"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <TextField
        id="login-password"
        label="Mot de passe"
        type="password"
        placeholder="Votre mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
    </Screen>
  );
};
