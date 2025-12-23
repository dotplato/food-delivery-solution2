
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  const isKitchen = process.argv.includes("--kitchen");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const route = isKitchen ? "kitchen" : "admin";

  // DEV: point to localhost (Next.js dev server)
  // PROD: point to built Next.js server (SSR)
  const url = isDev
    ? `http://localhost:3000/${route}`
    : `http://localhost:3000/${route}`; // Change this if you start Next.js server in prod

  mainWindow.loadURL(url);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Auto-set POS_MODE for your app
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      localStorage.setItem("POS_MODE", "true");
    `);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ===============================
// RECEIPT PRINTING (SILENT)
// ===============================
ipcMain.on("PRINT_RECEIPT", async (_, html) => {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: false,
    },
  });

  await printWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(html)
  );

  printWindow.webContents.print(
    {
      silent: true,
      printBackground: true,
    },
    () => {
      printWindow.close();
    }
  );
});

