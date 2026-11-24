import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@auth/providers/AuthProvider';
import { httpAuth } from '@auth/api/httpAuth';
import { configureHttpAuth } from '@common/api/http';
import { Router } from '@app/router';
import { ENV } from '@common/config/api.config';
import { queryClient } from '@app/queryClient';
import { UpdatePrompt } from '@app/pwa/UpdatePrompt';
import { listenForInstallPrompt } from '@common/utils/install.utils';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@common/styles/index.scss';

// Assemblage : le client HTTP partagé reçoit l'authentification avant toute requête
configureHttpAuth(httpAuth);
// Avant le premier rendu : le navigateur n'annonce l'installation possible qu'une fois
listenForInstallPrompt();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
      {/* Toasts du design system (design/Retours.dc.html) : surface haute, parchemin, ombre 2 */}
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#202534',
            color: '#E9DFC7',
            border: '1px solid #2C3345',
            borderRadius: '14px',
            boxShadow: '0 10px 28px rgba(0,0,0,.6), inset 0 1px 0 rgba(233,223,199,.06)',
            padding: '10px 14px',
            minHeight: '60px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '15px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#B98E45', secondary: '#0E1016' } },
          error: { duration: 5000, iconTheme: { primary: '#EE7F8B', secondary: '#0E1016' } },
        }}
      />
      <UpdatePrompt />
      {ENV === 'DEV' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
