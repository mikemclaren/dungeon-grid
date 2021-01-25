import { useEffect, useState } from "react";
import { HashRouter, Route } from "react-router-dom";

import { Classes, Drawer, Position } from "@blueprintjs/core";

import "./App.css";

import GridScreen from "./components/GridScreen";
import Sidebar from "./components/Sidebar";

const { ipcRenderer } = window.require("electron");

const randomThings = [
  "Hi, I love you.",
  "You look great.",
  "You're amazing.",
  "Perfect, you are.",
];

function App() {
  const [randomGoodness, setRandomGoodness] = useState("");
  const [entities, setEntities] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    setRandomGoodness(
      randomThings[Math.floor(Math.random() * randomThings.length)]
    );
    (async function () {
      const e = await ipcRenderer.sendSync("getStoreData", "entities");
      setEntities(JSON.parse(e));
    })();
  }, []);

  return (
    <div className="App">
      <HashRouter>
        <div>
          <Route path="/grid/new" component={GridScreen} />
        </div>
        <Drawer
          position={Position.LEFT}
          isOpen={drawerOpen}
          title={randomGoodness}
          size={Drawer.SIZE_SMALL}
        >
          <div className={Classes.DRAWER_BODY}>
            <div className={Classes.DIALOG_BODY}>
              <Sidebar entities={entities} closeDrawer={closeDrawer} />
            </div>
          </div>
        </Drawer>
      </HashRouter>
    </div>
  );
}

export default App;
