import { Component, useEffect, useState } from "react";
import { HashRouter, Route } from "react-router-dom";

import { Classes, Drawer, Position } from "@blueprintjs/core";

import "./App.css";

import GridScreen from "./components/GridScreen";
import Sidebar from "./components/Sidebar";
import { POPOVER_WRAPPER } from "@blueprintjs/core/lib/esm/common/classes";

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
  const [grids, setGrids] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);

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

      const g = await ipcRenderer.sendSync("getStoreData", "grids");
      if (g === "") {
        setGrids([]);
      } else {
        setGrids(JSON.parse(g));
      }
    })();

    ipcRenderer.on("update-grids", (event, arg) => {
      console.log(arg);
      setGrids(JSON.parse(arg));
    });
  }, []);

  const appHoc = (WrappedComponent) => {
    return class extends Component {
      render() {
        return <WrappedComponent {...this.props} grids={grids} />;
      }
    };
  };

  return (
    <div className="App">
      <HashRouter>
        <div>
          <Route path="/grid/new" component={GridScreen} />
          <Route path="/grid/:gridId" component={appHoc(GridScreen)} />
        </div>
        <Drawer
          position={Position.LEFT}
          isOpen={drawerOpen}
          title={randomGoodness}
          size={Drawer.SIZE_SMALL}
        >
          <div className={Classes.DRAWER_BODY}>
            <div className={Classes.DIALOG_BODY}>
              <Sidebar
                entities={entities}
                grids={grids}
                closeDrawer={closeDrawer}
              />
            </div>
          </div>
        </Drawer>
      </HashRouter>
    </div>
  );
}

export default App;
