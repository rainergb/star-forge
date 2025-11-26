import { contextBridge } from 'electron'

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => process.versions.electron,
  platform: process.platform,
})
