import { FormGroup, Switch } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { AlphabetFromNum } from "../../../alphabet";
import { updateCell } from "../../../cells";

const CellForm = ({ selectedCell = {}, setGridInfo = () => {} }) => {
  const [isObstacle, setIsObstacle] = useState(false);

  useEffect(() => {
    if (selectedCell.isObstacled) {
      setIsObstacle(true);
    } else {
      setIsObstacle(false);
    }
  }, [selectedCell]);

  useEffect(() => {
    setGridInfo((info) => {
      return Object.assign(
        {},
        updateCell(info, selectedCell.x, selectedCell.y, (d) => {
          d.isObstacled = isObstacle;

          return d;
        })
      );
    });
  }, [isObstacle, setGridInfo, selectedCell.x, selectedCell.y]);

  const handleObstacleChange = () => {
    setIsObstacle((o) => {
      return !o;
    });
  };

  return (
    <div className="Row">
      <div className="Col">
        <h2>
          Add to Cell {AlphabetFromNum(selectedCell.x)}
          {selectedCell.y}
        </h2>

        <Switch
          checked={isObstacle}
          labelElement={<strong>Obstacle</strong>}
          onChange={handleObstacleChange}
          large
        />
      </div>
    </div>
  );
};

export default CellForm;
