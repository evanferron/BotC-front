import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

// État de la connexion tel que TanStack Query le suit (événements online / offline du navigateur)
export const useIsOnline = () =>
  useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
    () => true
  );
