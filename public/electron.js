const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Detect if running in development mode
const isDev = !app.isPackaged;

let mainWindow;
let nextServer;

const startNextServer = () => {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In dev mode, assume Next.js dev server is already running
      resolve('http://localhost:3000');
      return;
    }

    // In production, start Next.js server
    const serverPath = path.join(process.resourcesPath, 'app');
    const nextBin = path.join(serverPath, 'node_modules', 'next', 'dist', 'bin', 'next');

    // Find available port
    const port = 3456;

    nextServer = spawn(process.execPath, [nextBin, 'start', '-p', port.toString()], {
      cwd: serverPath,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (!started && data.toString().includes('Ready')) {
        started = true;
        resolve(`http://localhost:${port}`);
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js error: ${data}`);
    });

    nextServer.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      reject(err);
    });

    // Fallback timeout - try to connect anyway after 5 seconds
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(`http://localhost:${port}`);
      }
    }, 5000);
  });
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'logos', 'syntalys-desktop-icon.png'),
  });

  try {
    const serverUrl = await startNextServer();
    await mainWindow.loadURL(serverUrl);
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error('Failed to load app:', error);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

// Menu
const template = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Salir',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Editar',
    submenu: [
      { role: 'undo', label: 'Deshacer' },
      { role: 'redo', label: 'Rehacer' },
      { type: 'separator' },
      { role: 'cut', label: 'Cortar' },
      { role: 'copy', label: 'Copiar' },
      { role: 'paste', label: 'Pegar' },
    ],
  },
  {
    label: 'Ver',
    submenu: [
      { role: 'reload', label: 'Recargar' },
      { role: 'forceReload', label: 'Forzar recarga' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Zoom normal' },
      { role: 'zoomIn', label: 'Acercar' },
      { role: 'zoomOut', label: 'Alejar' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Pantalla completa' },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
