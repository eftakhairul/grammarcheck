const { app, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');

Store.initRenderer();

function getIcon() {
  if (process.platform === 'win32') return path.join(__dirname, 'assets/icon.ico');
  if (process.platform === 'darwin') return path.join(__dirname, 'assets/icon.icns');
  return path.join(__dirname, 'assets/icon.png');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset',
    icon: getIcon(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple MVP to allow require in renderer if needed, but we'll stick to fetch. 
      // Actually, for "simple" without preload complexity, nodeIntegration: true is easiest for file access if needed, 
      // but for just fetch, standards work. Let's keep it simple.
    }
  });

  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'assets/icon.png'));
  }
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
