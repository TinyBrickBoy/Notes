const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const dataFile = path.join(app.getPath("userData"), "notes.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    frame: false,                // Kein Fensterrahmen, keine native Titlebar
    transparent: false,          // Fenster nicht transparent (kann man anpassen)
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // Optional: DevTools zum Testen öffnen
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

function readNotes() {
  try {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeNotes(notes) {
  fs.writeFileSync(dataFile, JSON.stringify(notes));
}

ipcMain.handle("load-notes", async () => {
  return readNotes();
});

ipcMain.handle("save-note", async (event, note) => {
  let notes = readNotes();
  notes.push(note);
  writeNotes(notes);
  return notes;
});

ipcMain.handle("update-note", async (event, index, newText) => {
  let notes = readNotes();
  if (notes[index] !== undefined) {
    notes[index] = newText;
    writeNotes(notes);
  }
  return notes;
});

ipcMain.handle("delete-note", async (event, index) => {
  let notes = readNotes();
  if (notes[index] !== undefined) {
    notes.splice(index, 1);
    writeNotes(notes);
  }
  return notes;
});

// Fenster-Steuerungs-Events
ipcMain.on("window-minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.minimize();
});

ipcMain.on("window-close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});
