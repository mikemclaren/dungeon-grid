const { ipcRenderer } = window.require("electron");

export const fetchFromCache = async (type, index) => {
  const res = await ipcRenderer.invoke('fetchFromCache', type, index);

  return JSON.parse(res);
};
