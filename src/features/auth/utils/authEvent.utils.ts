type AuthEvent = 'EXPIRED';

type Listener = (event: AuthEvent) => void;

let listeners: Listener[] = [];

export const subscribeAuthEvent = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const emitAuthEvent = (event: AuthEvent) => {
  listeners.forEach((l) => l(event));
};
