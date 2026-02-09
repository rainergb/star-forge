import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  // Remove menu bar
  Menu.setApplicationMenu(null);

  // Get icon path
  const iconPath = isDev
    ? path.join(__dirname, "../src/assets/icon.ico")
    : path.join(__dirname, "../dist/assets/icon.ico");

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
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

  ipcMain.handle("api-request", async (event, { method, url, body }) => {
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
