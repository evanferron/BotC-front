import BaseLayout from '@/core/components/layout/BaseLayout/BaseLayout';
import Alertes from '@/pages/Alertes/Alertes';
import Error from '@/pages/Error/Error';
import Groups from '@/pages/Groups/Groups';
import Login from '@/pages/Login/Login';
import Signals from '@/pages/Signals/Signals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Suspense } from 'react';
import AnimatedLogo from '@/core/components/ui/AnimatedLogo/AnimatedLogo';
import Rules from '@/pages/Rules/Rules';
import Profiles from '@/pages/Profiles/Profiles';
import ForgotPassword from '@/pages/ForgotPassword/ForgotPassword';

const Router: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<AnimatedLogo />}>
      <Routes>
        {/* ### Routes non protégées ### */}

        <Route path="/connexion" element={<Login />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/changement-mot-de-passe" element={<ForgotPassword isReset />} />
        <Route
          path="/dashboard"
          element={
            <BaseLayout
              title="Dashboard des Alertes"
              description="Monitoring des alertes en temps réel"
            >
              <Alertes />
            </BaseLayout>
          }
        />
        {/* ### Routes protégées ### */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/groupes"
            element={
              <BaseLayout
                title="Gestion des Groupes"
                pageTitle="Groupes"
                description="Visualisez et gérez vos groupes organisationnels en arborescence"
              >
                <Groups />
              </BaseLayout>
            }
          />
          <Route
            path="/regles"
            element={
              <BaseLayout
                title="Gestion des Règles"
                description="Configurez des règles en combinant des triggers pour générer des alertes lors de la détection d'anomalies."
              >
                <Rules />
              </BaseLayout>
            }
          />
          <Route
            path="/profils"
            element={
              <BaseLayout
                title="Gestion des Profils"
                pageTitle="Profils"
                description="Visualisez et gérez vos profils utilisateurs"
              >
                <Profiles />
              </BaseLayout>
            }
          />
          <Route
            path="/alertes"
            element={
              <BaseLayout
                title="Gestion des Alertes"
                description="Monitoring et gestion des alertes en temps réel"
              >
                <Alertes />
              </BaseLayout>
            }
          />

          {/* ### Route not found (fallback) ### */}
          <Route
            path="/signaux"
            element={
              <BaseLayout
                title="Gestion des Signaux"
                description="Visualisez et gérez les signaux scannés"
              >
                <Signals />
              </BaseLayout>
            }
          />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
