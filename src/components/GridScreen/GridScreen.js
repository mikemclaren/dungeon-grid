import { IconNames } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { fetchCellData, updateCell } from "../../cells";
import CellForm from "./CellForm";
import { results as monsters } from "../../data/monsters.json";
import keyboardjs from "keyboardjs";

import "./GridScreen.css";

const { ipcRenderer } = window.require("electron");

const {
  FormGroup,
  InputGroup,
  NumericInput,
  Button,
  Intent,
  Switch,
} = require("@blueprintjs/core");

const { default: Grid } = require("../Grid/Grid");

const GRID_DEFAULTS = 8;

const GridScreen = ({ entities = [], grids = [] }) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(GRID_DEFAULTS);
  const [height, setHeight] = useState(GRID_DEFAULTS);
  const [selectedCell, setSelectedCell] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [obstacleModeEnabled, setObstacleModeEnabled] = useState(false);
  const [zoom, setZoom] = useState(5);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableMonsters, setAvailableMonsters] = useState(monsters);
  const [redirect, setRedirect] = useState(null);

  const { gridId } = useParams();

  const [gridInfo, setGridInfo] = useState({
    width: GRID_DEFAULTS,
    height: GRID_DEFAULTS,
    cells: [],
  });

  useEffect(() => {
    keyboardjs.bind('command + o', (e) => {
      e.preventRepeat();
      setObstacleModeEnabled(o => !o);
    });

    keyboardjs.bind('-', (e) => {
      setZoom((z) => {
        if (z > 0) {
          return z - 1;
        }

        return z;
      });
    });

    keyboardjs.bind('=', (e) => {
      setZoom((z) => {
        if (z < 10) {
          return z + 1;
        }

        return z;
      });
    });

    return () => {
      keyboardjs.unbind('command + o');
      keyboardjs.unbind('-');
      keyboardjs.unbind('=');
    };
  }, []);

  useEffect(() => {
    setAvailableEntities(entities);
  }, [entities]);

  useEffect(() => {
    for (let i = 0; i < grids.length; i++) {
      if (grids[i].gridId === parseInt(gridId)) {
        setGridInfo(grids[i]);
        setWidth(grids[i].width);
        setHeight(grids[i].height);
        setName(grids[i].name);
      }
    }
  }, [grids, gridId]);

  useEffect(() => {
    if (!saving) {
      setSaved(true);

      const timeout = setTimeout(() => {
        setSaved(false);
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [saving]);

  const onNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setGridInfo((info) => {
      info.name = val;

      return info;
    });
  };

  const setWidthVal = (num) => {
    if(!isNaN(num)) {
      setWidth(num);
      setGridInfo((info) => {
        info.width = num;
  
        return info;
      });  
    }
  };

  const setHeightVal = (num) => {
    if(!isNaN(num)) {
      setHeight(num);
      setGridInfo((info) => {
        info.height = num;

        return info;
      });
    }
  };

  const onCellClick = (x, y) => {
    if (obstacleModeEnabled) {
      setGridInfo((info) => {
        const i = Object.assign(
          {},
          updateCell(info, x, y, (d) => {
            if (d.isObstacled) {
              delete d.isObstacled;
            } else {
              d.isObstacled = true;
            }

            return d;
          })
        );

        return i;
      });

      return;
    }

    if (selectedCell.x !== x || selectedCell.y !== y) {
      setSelectedCell({
        ...fetchCellData(gridInfo, x, y),
        actuallyExists: true,
      });
    }
  };

  const saveGrid = async () => {
    setSaving(true);

    if (!gridInfo.gridId) {
      gridInfo.gridId = Date.now();
    }

    await ipcRenderer.sendSync("saveGrid", gridInfo);
    setGridInfo(gridInfo);
    setSaving(false);
  };

  const playGrid = async () => {
    setRedirect(`/play/${gridInfo.gridId}`);
  };

  const handleObstacleModeChange = () => {
    setObstacleModeEnabled((o) => {
      return !o;
    });
  };

  const onEntitySelect = (oldEntity, newEntity) => {
    setAvailableEntities(es => {
      const newEntities = availableEntities;
      if (newEntity?.entityId) {
        for (let i = 0; i < newEntities.length; i++) {
          if (newEntities[i].entityId === newEntity.entityId) {
            newEntities.splice(i, 1);
            break;
          }
        }
      }

      if (oldEntity?.entityId) {
        const some = newEntities.some(v => v.entityId === oldEntity.entityId);

        if (!some) {
          newEntities.push(oldEntity);
        }
      }

      return [].concat(newEntities);
    });
  };

  return (
    <div>
      {redirect && <Redirect to={redirect} />}

      <div className="GridScreenGridFormWrapper">
        <h1>
          {!gridId && "New Grid ("}
          {name}
          {!gridId && ")"}
        </h1>

        {(name || gridId) && (
          <Button
            onClick={playGrid}
            icon={IconNames.PLAY}
            intent={Intent.SUCCESS}
            fill
            className="GridScreen__SaveButton"
          >
            Start Play Mode
          </Button>
        )}

        <div className="Row">
          <div className="Col">
            <FormGroup label="Grid Name" labelFor="grid-name">
              <InputGroup
                leftIcon={IconNames.EDIT}
                id="grid-name"
                placeholder="Choose a name, make it güd"
                onChange={onNameChange}
                defaultValue={name === "" ? null : name}
              />
            </FormGroup>

            <FormGroup label="Grid Height" labelFor="grid-height">
              <NumericInput
                leftIcon={IconNames.ARROWS_VERTICAL}
                id="grid-height"
                min={5}
                max={20}
                defaultValue={GRID_DEFAULTS}
                value={height}
                onValueChange={setHeightVal}
              />
            </FormGroup>

            <FormGroup label="Grid Width" labelFor="grid-width">
              <NumericInput
                leftIcon={IconNames.ARROWS_HORIZONTAL}
                id="grid-width"
                min={5}
                max={20}
                value={width}
                defaultValue={GRID_DEFAULTS}
                onValueChange={setWidthVal}
              />
            </FormGroup>

            {(name || gridId) && (
              <Button
                disabled={saving}
                onClick={saveGrid}
                icon={!saved ? IconNames.UPLOAD : IconNames.SAVED}
                intent={Intent.PRIMARY}
                fill
                className="GridScreen__SaveButton"
              >
                Save
              </Button>
            )}

            <Switch
              checked={obstacleModeEnabled}
              labelElement={<strong>Obstacle Mode</strong>}
              onChange={handleObstacleModeChange}
              large
            />


            {selectedCell.actuallyExists && (
              <CellForm
                selectedCell={selectedCell}
                setGridInfo={setGridInfo}
                entities={availableEntities}
                onEntitySelect={onEntitySelect}
                monsters={availableMonsters}
                gridInfo={gridInfo}
              />
            )}
          </div>
        </div>
      </div>

      <div className="GridScreen__Grid">
        <Grid
          width={gridInfo.width}
          height={gridInfo.height}
          selectedCell={selectedCell}
          onCellClick={onCellClick}
          gridInfo={gridInfo}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default GridScreen;
