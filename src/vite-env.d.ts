/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    getAppVersion: () => string
    platform: string
  }
}
