const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadNotes: () => ipcRenderer.invoke("load-notes"),
  saveNote: (note) => ipcRenderer.invoke("save-note", note),
  updateNote: (index, newText) => ipcRenderer.invoke("update-note", index, newText),
  deleteNote: (index) => ipcRenderer.invoke("delete-note", index),

  // Fenstersteuerung
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  closeWindow: () => ipcRenderer.send("window-close"),
});
