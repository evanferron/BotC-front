import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '@/components/Screen/Screen';
import { PhaseBar } from '@/components/PhaseBar/PhaseBar';
import { TextField } from '@/components/TextField/TextField';
import { Button } from '@/components/Button/Button';
import { PUBLIC_ROUTES } from '@/config/routes.config';
import { getErrorStatus } from '@/utils/api.utils';
import { useRegisterMutation } from '@auth/api/useRegisterMutation';
import { AUTH_ERROR_MESSAGES, getCommonAuthError } from '@auth/utils/authError.utils';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PSEUDO_MAX_LENGTH,
  PSEUDO_MIN_LENGTH,
} from '@auth/constants/ACCOUNT_RULES';
import styles from './Register.module.scss';

// Écran 01b de la maquette (C1-Creation)
export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: registerRequest, isPending } = useRegisterMutation();

  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [pseudoError, setPseudoError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    document.title = 'Créer un compte · Cadran';
  }, []);

  const cleanedPseudo = pseudo.trim();
  const isValid =
    cleanedPseudo.length >= PSEUDO_MIN_LENGTH && password.length >= PASSWORD_MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPseudoError(undefined);
    setFormError(undefined);
    if (!isValid) return;

    try {
      // La redirection est faite par PublicLayout dès que la session existe
      await registerRequest({ pseudo: cleanedPseudo, password });
    } catch (err) {
      if (getErrorStatus(err) === 409) {
        setPseudoError(AUTH_ERROR_MESSAGES.PSEUDO_TAKEN);
      } else {
        setFormError(getCommonAuthError(err));
      }
    }
  };

  return (
    <Screen
      header={<PhaseBar title="Créer un compte" />}
      onSubmit={handleSubmit}
      footer={
        <>
          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" size="xl" disabled={!isValid} isLoading={isPending}>
            Créer mon compte
          </Button>
          <Button
            variant="ghost"
            onClick={() => void navigate(PUBLIC_ROUTES.LOGIN, { state: location.state })}
          >
            J'ai déjà un compte
          </Button>
        </>
      }
    >
      <h2 className={styles.title}>Créer mon compte</h2>
      <TextField
        id="register-pseudo"
        label="Pseudo"
        placeholder="Par exemple : Evan"
        autoComplete="username"
        autoCapitalize="none"
        showCount
        maxLength={PSEUDO_MAX_LENGTH}
        value={pseudo}
        onChange={(e) => {
          setPseudo(e.target.value);
          setPseudoError(undefined);
        }}
        hint={`${PSEUDO_MIN_LENGTH} caractères au moins. Visible par tous les joueurs.`}
        error={pseudoError}
      />
      <TextField
        id="register-password"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        maxLength={PASSWORD_MAX_LENGTH}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={`${PASSWORD_MIN_LENGTH} caractères au moins.`}
      />
    </Screen>
  );
};
