declare global {
  interface Window {
    showToastNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  }
}

export {};
