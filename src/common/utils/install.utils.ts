// Invitation à installer l'appli (design/J6 24f). Chrome et Edge annoncent l'installation possible
// une seule fois, au chargement : l'événement est capté ici dès le démarrage et gardé pour plus tard.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'botc.install-dismissed';

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export const listenForInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Pas de mini-barre du navigateur : l'appli propose l'installation au bon moment
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
};

export const subscribeInstallPrompt = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const canPromptInstall = () => deferred !== null;

// Ouvre la fenêtre d'installation du navigateur ; `true` si le joueur a accepté
export const promptInstall = async () => {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  notify();
  await event.prompt();
  return (await event.userChoice).outcome === 'accepted';
};

// Déjà lancée depuis l'écran d'accueil
export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPhone et iPad : pas d'événement d'installation, seulement « Sur l'écran d'accueil »
export const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// L'invitation n'est proposée qu'une fois : « Plus tard » la range définitivement
export const isInstallDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

export const dismissInstall = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    // Stockage indisponible (navigation privée) : l'invitation reviendra, sans gravité
  }
};
