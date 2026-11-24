import { Sheet } from '@common/components/Sheet/Sheet';
import { Button } from '@common/components/Button/Button';
import { Loading } from '@common/components/Loading/Loading';
import { useCardsQuery } from '@games/api/distribution.api';
import { RoleCard } from '../RoleCard/RoleCard';
import styles from './MyRoleSheet.module.scss';

interface MyRoleSheetProps {
  gameId: string;
  onClose: () => void;
}

// Bouton « Mon rôle » du bandeau : la carte reste masquée, appui long pour la voir
export const MyRoleSheet = ({ gameId, onClose }: MyRoleSheetProps) => {
  const { data, isLoading } = useCardsQuery(gameId);
  const role = data?.my_role;
  return (
    <Sheet
      open
      title="Votre rôle"
      description="Maintenez la carte pour la révéler. Gardez votre rôle secret."
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className={styles.card}>
        {isLoading && <Loading label="Chargement…" />}
        {role && <RoleCard role={role} masked />}
      </div>
    </Sheet>
  );
};
