import { IconNames } from "@blueprintjs/icons";
import { useState } from "react";

const { FormGroup, InputGroup, NumericInput } = require("@blueprintjs/core");
const { default: Grid } = require("../Grid/Grid");

const GridScreen = ({ grid = null }) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div>
      {!grid && <h1>New Grid</h1>}

      <div className="GridScreenGridFormWrapper">
        <div className="Row">
          <div className="Col">
            <FormGroup label="Grid Name" labelFor="grid-name">
              <InputGroup
                leftIcon={IconNames.EDIT}
                id="grid-name"
                placeholder="Choose a name, make it güd"
                onChange={onNameChange}
              />
            </FormGroup>

            <FormGroup label="Grid Height" labelFor="grid-height">
              <NumericInput
                leftIcon={IconNames.ARROWS_VERTICAL}
                id="grid-height"
                min={5}
                max={20}
                defaultValue={8}
                onValueChange={setHeight}
              />
            </FormGroup>

            <FormGroup label="Grid Width" labelFor="grid-width">
              <NumericInput
                leftIcon={IconNames.ARROWS_HORIZONTAL}
                id="grid-width"
                min={5}
                max={20}
                defaultValue={8}
                onValueChange={setWidth}
              />
            </FormGroup>
          </div>

          <div className="Col2">
            <Grid width={width} height={height} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridScreen;
