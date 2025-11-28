/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    getAppVersion: () => string;
    platform: string;
    request: (
      method: string,
      url: string,
      body?: any
    ) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
}
