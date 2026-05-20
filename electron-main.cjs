const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'public/vite.svg') // Change icon if needed
  });

  // Check if we are in development mode
  const isDev = !app.isPackaged;

  if (isDev) {
    // In dev, load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // Spawn the Express backend (server.mjs)
  const serverPath = path.join(__dirname, 'server.mjs');
  
  // Need to run node with experimental modules if it's an mjs file
  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 5000 }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server process.', err);
  });
}

app.whenReady().then(() => {
  startServer();
  
  // Give the server a second to start before opening the window
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  // Kill the backend server when Electron closes
  if (serverProcess) {
    serverProcess.kill();
  }
});
