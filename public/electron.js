const path = require("path");

const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
const got = require('got');

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const dataStore = new Store();

if (!dataStore.has("entities")) {
  dataStore.set("entities", "");
}

if (!dataStore.has("grids")) {
  dataStore.set("grids", "");
}

ipcMain.on("getStoreData", (event, arg) => {
  event.returnValue = dataStore.get(arg);
});

ipcMain.on("saveGrid", (event, arg) => {
  let grids = dataStore.get("grids");
  grids = grids === "" ? [] : JSON.parse(grids);

  let found = false;
  for (let i = 0; i < grids.length; i++) {
    if (grids[i].gridId === arg.gridId) {
      grids[i] = arg;
      found = true;
      break;
    }
  }

  if (!found) {
    grids.push(arg);
  }

  dataStore.set("grids", JSON.stringify(grids));
  event.returnValue = true;

  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("update-grids", JSON.stringify(grids));
});

ipcMain.on("saveEntity", (event, arg) => {
  let entities = dataStore.get("entities");
  entities = entities === "" ? [] : JSON.parse(entities);

  let found = false;
  for (let i = 0; i < entities.length; i++) {
    if (entities[i].entityId === arg.entityId) {
      entities[i] = arg;
      found = true;
      break;
    }
  }

  if (!found) {
    entities.push(arg);
  }

  dataStore.set("entities", JSON.stringify(entities));
  event.returnValue = true;

  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("update-entities", JSON.stringify(entities));
});

ipcMain.on("wipeData", (event, arg) => {
  dataStore.reset();

  dataStore.set("entities", "");
  dataStore.set("grids", "");
  event.returnValue = true;
});

ipcMain.handle("fetchFromCache", async (event, type, index) => {
  if (!dataStore.has(`${type}:${index}`)) {
    try {
      const { body } = await got(`https://www.dnd5eapi.co/api/${type}/${index}`);
      dataStore.set(`${type}:${index}`, body);

      return body;
    } catch (ex) {
      console.error(ex);
      return JSON.stringify({
        error: 'Error fetching from API.'
      });
    }
  }

  return dataStore.get(`${type}:${index}`);
});

ipcMain.handle("saveGrid", async (event, gridInfo) => {
  let grids = dataStore.get("grids");
  grids = grids === "" ? [] : JSON.parse(grids);

  let found = false;
  for (let i = 0; i < grids.length; i++) {
    if (grids[i].gridId === gridInfo.gridId) {
      grids[i] = gridInfo;
      found = true;
      break;
    }
  }

  if (!found) {
    grids.push(gridInfo);
  }

  dataStore.set("grids", JSON.stringify(grids));
  event.returnValue = true;

  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("update-grids", JSON.stringify(grids));
});