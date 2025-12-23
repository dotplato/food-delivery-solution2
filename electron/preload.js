
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pos", {
  printReceipt: (html) => {
    ipcRenderer.send("PRINT_RECEIPT", html);
  }
});

