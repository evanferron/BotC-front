import toast, { type ToastOptions } from 'react-hot-toast';

// Toasts du design system (design/Retours.dc.html), style défini dans main.tsx

export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, options);
};

export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, options);
};

export const showInfo = (message: string, options?: ToastOptions) => {
  toast(message, options);
};

export const dismissAll = () => {
  toast.dismiss();
};
