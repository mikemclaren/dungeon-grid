import { useEffect, useState } from "react";
import { HashRouter, Route } from "react-router-dom";

import { Button, Classes, Colors, Drawer, Icon, Position } from "@blueprintjs/core";

import "./App.css";

import GridScreen from "./components/GridScreen";
import Sidebar from "./components/Sidebar";
import EntityForm from "./components/EntityForm";
import { IconNames } from "@blueprintjs/icons";
import PlayScreen from "./components/PlayScreen";

const { ipcRenderer } = window.require("electron");

const randomThings = [
  "Hi, I love you.",
  "You look great.",
  "You're amazing.",
  "Perfect, you are.",
  "Who's the best DM? You.",
];

window.addEventListener("keydown", function(e) {
  // space and arrow keys
  if([32, 37, 38, 39, 40].indexOf(e.which) > -1) {
    e.preventDefault();
  }
}, false);

function App() {
  const [randomGoodness, setRandomGoodness] = useState("");
  const [entities, setEntities] = useState([]);
  const [grids, setGrids] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dnData, setDnData] = useState({});

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  useEffect(() => {
    setRandomGoodness(
      randomThings[Math.floor(Math.random() * randomThings.length)]
    );

    (async function () {
      const e = await ipcRenderer.sendSync("getStoreData", "entities");
      if (e === "") {
        setEntities([]);
      } else {
        setEntities([].concat(JSON.parse(e)));
      }

      const g = await ipcRenderer.sendSync("getStoreData", "grids");
      if (g === "") {
        setGrids([]);
      } else {
        setGrids(JSON.parse(g));
      }
    })();

    ipcRenderer.on("update-grids", (event, arg) => {
      setGrids(JSON.parse(arg));
    });

    ipcRenderer.on("receive-dnd-data", (event, arg) => {
      const data = JSON.parse(arg);
      setDnData((d) => ({ ...d, [data.type]: data.results }));
    });

    ipcRenderer.on("update-entities", (event, arg) => {
      setEntities(JSON.parse(arg));
    });
  }, []);

  return (
    <div className="App">
      <HashRouter>
        <div className="AppSideMenu">
          <div>
            <Button icon={IconNames.MENU_OPEN} onClick={openDrawer} />
          </div>

          <div className="AppSideMenu__Heart">
            <Icon icon={IconNames.HEART} color={Colors.VIOLET5} />
          </div>
        </div>

        <div className="RouteContents">
          <Route path="/grid" render={(props) => (
            <GridScreen {...props} entities={entities} grids={grids} />
          )} exact />
          <Route path="/grid/:gridId" render={(props) => (
            <GridScreen {...props} entities={entities} grids={grids} />
          )} />
          <Route path="/entity" render={(props) => (
            <EntityForm {...props} entities={entities} grids={grids} />
          )} exact />
          <Route
            path="/entity/:entityId"
            render={(props) => (
              <EntityForm {...props} entities={entities} grids={grids} />
            )}
            exact
          />
          <Route
            path="/play/:gridId"
            render={(props) => (
              <PlayScreen {...props} entities={entities} grids={grids} />
            )}
            exact
          />
        </div>

        <Drawer
          position={Position.LEFT}
          isOpen={drawerOpen}
          title={randomGoodness}
          size={Drawer.SIZE_SMALL}
          onClose={closeDrawer}
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
