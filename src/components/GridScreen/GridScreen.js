import { IconNames } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlphabetFromNum } from "../../alphabet";
import CellForm from "./CellForm";

const { ipcRenderer } = window.require("electron");

const {
  FormGroup,
  InputGroup,
  NumericInput,
  Button,
  Intent,
} = require("@blueprintjs/core");

const { default: Grid } = require("../Grid/Grid");

const GRID_DEFAULTS = 8;

const GridScreen = ({ grids = [] }) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(GRID_DEFAULTS);
  const [height, setHeight] = useState(GRID_DEFAULTS);
  const [selectedCell, setSelectedCell] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { gridId } = useParams();

  const [gridInfo, setGridInfo] = useState({
    width: GRID_DEFAULTS,
    height: GRID_DEFAULTS,
    cells: {},
  });

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
    setGridInfo((info) => {
      if (info.width !== width) {
        info.width = width;
      }

      if (info.height !== height) {
        info.height = height;
      }

      return info;
    });
  }, [width, height]);

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
    setWidth(num);
    setGridInfo((info) => {
      info.width = num;

      return info;
    });
  };

  const setHeightVal = (num) => {
    setHeight(num);
    setGridInfo((info) => {
      info.height = num;

      return info;
    });
  };

  const onCellClick = (x, y) => {
    if (selectedCell.x !== x || selectedCell.y !== y) {
      setSelectedCell({
        x,
        y,
        actuallyExists: true,
      });
    } else {
      setSelectedCell({});
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

  return (
    <div>
      <h1>
        {(name || gridId) && (
          <Button
            disabled={saving}
            onClick={saveGrid}
            icon={IconNames.UPLOAD}
            intent={Intent.SUCCESS}
          >
            Save
          </Button>
        )}{" "}
        {!gridId && "New Grid ("}
        {name}
        {!gridId && ")"}
      </h1>

      <div className="GridScreenGridFormWrapper">
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
                onValueChange={setHeightVal}
              />
            </FormGroup>

            <FormGroup label="Grid Width" labelFor="grid-width">
              <NumericInput
                leftIcon={IconNames.ARROWS_HORIZONTAL}
                id="grid-width"
                min={5}
                max={20}
                defaultValue={GRID_DEFAULTS}
                onValueChange={setWidthVal}
              />
            </FormGroup>

            {selectedCell.actuallyExists && (
              <CellForm selectedCell={selectedCell} setGridInfo={setGridInfo} />
            )}
          </div>

          <div className="Col2">
            <Grid
              width={gridInfo.width}
              height={gridInfo.height}
              selectedCell={selectedCell}
              onCellClick={onCellClick}
              gridInfo={gridInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridScreen;
