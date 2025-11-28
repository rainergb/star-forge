import { contextBridge, ipcRenderer } from "electron";

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => process.versions.electron,
  platform: process.platform,
  request: (method: string, url: string, body?: any) =>
    ipcRenderer.invoke("api-request", { method, url, body })
});
