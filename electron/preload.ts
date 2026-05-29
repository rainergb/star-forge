import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => process.versions.electron,
  platform: process.platform,
  request: (method: string, url: string, body?: any) =>
    ipcRenderer.invoke("api-request", { method, url, body }),

  // Abre uma URL no browser padrão do sistema (usado para OAuth em produção)
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),

  // Escuta o callback do OAuth após o browser redirecionar para star-forge://
  onOAuthCallback: (callback: (url: string) => void) => {
    ipcRenderer.on("oauth-callback", (_event, url: string) => callback(url));
  },

  // Configura abertura automática com o sistema
  setLoginItem: (openAtLogin: boolean) =>
    ipcRenderer.invoke("set-login-item", openAtLogin),
  getLoginItem: () => ipcRenderer.invoke("get-login-item")
});
