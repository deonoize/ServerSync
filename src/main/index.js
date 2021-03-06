import {app, BrowserWindow, globalShortcut, Tray, Menu} from 'electron'

const os = require("os");
const path = require("path");

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        backgroundColor: "lightgray",
        center: true,
        frame: false,
        height: 600,
        width: 800,
        minHeight: 300,
        minWidth: 500,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, "../renderer/assets/image/icon.ico")
    });

    mainWindow.loadURL(winURL);

    const platform = os.platform();
    if (platform === "darwin") {
        globalShortcut.register("Command+Option+I", () => {
            mainWindow.webContents.openDevTools();
        });
    } else if (platform === "linux" || platform === "win32") {
        globalShortcut.register("Control+Shift+I", () => {
            mainWindow.webContents.openDevTools();
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null);
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
