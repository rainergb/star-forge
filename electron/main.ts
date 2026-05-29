import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";

// ─── Protocolo customizado para OAuth ────────────────────────────────────────
// Google OAuth sempre abre no browser do sistema (dev e prod).
// O callback volta via star-forge:// que Electron intercepta.
//
// Em DEV (process.defaultApp === true), precisamos passar process.execPath e
// o path do projeto para o Windows saber como reabrir a instância correta.
// Em PROD, o executável buildado se auto-registra sem args extras.
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("star-forge", process.execPath, [
      path.resolve(process.argv[1])
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("star-forge");
}

// ─── Single Instance Lock — necessário para deep links no Windows/Linux ──────
let mainWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // Segunda instância foi aberta (Windows abre nova instância para o deep link)
  app.quit();
} else {
  // Recebe a URL de deep link quando já há uma instância rodando (Windows/Linux)
  app.on("second-instance", (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith("star-forge://"));
    if (url && mainWindow) {
      mainWindow.webContents.send("oauth-callback", url);
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  Menu.setApplicationMenu(null);

  const iconPath = isDev
    ? path.join(__dirname, "../src/assets/icon.ico")
    : path.join(__dirname, "../dist/assets/icon.ico");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // sandbox precisa ser false para preload ESM (.mjs) funcionar no Electron 28.
      // Preload sandboxed SÓ aceita CommonJS; como vite-plugin-electron@0.28 +
      // "type":"module" gera ESM, desativamos o sandbox aqui. As proteções
      // principais (contextIsolation + nodeIntegration:false) permanecem ativas.
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  // ─── Abre URL no browser e minimiza Electron para o browser ficar visível ───
  ipcMain.handle("open-external", async (_event, url: string) => {
    await shell.openExternal(url);
    // Minimiza a janela do Electron para que o browser venha para frente
    if (mainWindow && !mainWindow.isMinimized()) {
      mainWindow.minimize();
    }
  });

  // ─── Configurar abertura automática com o sistema ──────────────────────────
  ipcMain.handle("set-login-item", async (_event, openAtLogin: boolean) => {
    try {
      // Em dev (process.defaultApp), aponta para o exe do Electron + path do projeto.
      // Em prod, o exe buildado se auto-registra corretamente.
      if (process.defaultApp) {
        app.setLoginItemSettings({
          openAtLogin,
          path: process.execPath,
          args: process.argv.length >= 2 ? [path.resolve(process.argv[1])] : []
        });
      } else {
        app.setLoginItemSettings({ openAtLogin });
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to set login item:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("get-login-item", async () => {
    try {
      const settings = app.getLoginItemSettings();
      return { success: true, openAtLogin: settings.openAtLogin };
    } catch (error) {
      console.error("Failed to get login item:", error);
      return { success: false, openAtLogin: false };
    }
  });

  // ─── Configuração local (config.txt) ───────────────────────────────────────
  ipcMain.handle("api-request", async (_event, { method, url, body }) => {
    if (url === "/config") {
      const dataPath = path.join(process.cwd(), "src", "data", "config.txt");

      if (method === "GET") {
        try {
          if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, "utf-8");
            return { success: true, data: JSON.parse(data) };
          }
          return { success: true, data: null };
        } catch (error) {
          console.error("Failed to get config:", error);
          return { success: false, error: (error as Error).message };
        }
      }

      if (method === "PUT") {
        try {
          const dir = path.dirname(dataPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(dataPath, JSON.stringify(body, null, 2));
          return { success: true };
        } catch (error) {
          console.error("Failed to save config:", error);
          return { success: false, error: (error as Error).message };
        }
      }
    }

    return { success: false, error: "Route not found" };
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ─── macOS: deep link quando o app já está aberto ───────────────────────────
// No macOS o sistema dispara open-url em vez de nova instância
app.on("open-url", (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send("oauth-callback", url);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
