import {
  Button,
  FormGroup,
  MenuItem,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { useCallback, useEffect, useState } from "react";

import { AlphabetFromNum } from "../../../alphabet";
import { fetchCellData, updateCell } from "../../../cells";
import { fetchFromCache } from "../../../services/cache";
import keyboardjs from "keyboardjs";
import { EntitySizes } from "../../../entities";

const filterByName = (query, item) => {
  if (item.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
    return true;
  }

  return false;
};

const EntitySelect = (entity, { handleClick, modifiers }, onEntitySelect = () => {}) => {
  return (
    <MenuItem
      onClick={handleClick}
      active={modifiers.active}
      key={entity.entityId}
      text={entity.name}
    />
  );
};

const CellForm = ({ onEntitySelect = () => {}, selectedCell = {}, gridInfo = {}, setGridInfo = () => {}, entities = [], monsters = [] }) => {
  const [occupant, setOccupant] = useState("empty");
  const [entityLists, setEntityLists] = useState({});
  const [entity, setEntity] = useState(null);
  const [mob, setMob] = useState({});
  const [cellInfo, setCellInfo] = useState({});

  useEffect(() => {
    keyboardjs.bind('command + e', (e) => {
      e.preventRepeat();

      clearCell();
    });

    return () => {
      keyboardjs.unbind('command + e');
    };
  }, []);

  useEffect(() => {
    setEntityLists(entities);
  }, [entities]);

  useEffect(() => {
    setOccupant("empty");
    setEntity(null);
    setMob(null);

    if (selectedCell.isObstacled) {
      setOccupant("obstacle");
      setEntity(null);
    } else if (selectedCell.entity) {
      setEntity(selectedCell.entity);
      setOccupant("entity");
    } else if (selectedCell.monster) {
      setOccupant("monster");
      setMob(selectedCell.monster);
    }

    setCellInfo(selectedCell);
  }, [selectedCell]);

  useEffect(() => {
    setGridInfo((info) => {
      return Object.assign(
        {},
        updateCell(info, cellInfo.x, cellInfo.y, (d) => {
          d.isObstacled = occupant === "obstacle";

          if (occupant === "entity") {
            d.entity = entity;
            d.monster = null;
          } else if (occupant === "monster") {
            d.entity = null;
            d.monster = mob;
          } else if (occupant === "obstacle" || occupant === "empty") {
            d.entity = null;
            d.monster = null;
          }
  
          return d;
        })
      );
    });  
  }, [occupant, entity, mob, setGridInfo, cellInfo]);

  const clearCell = () => {
    setOccupant("empty");
    setEntity(null);
    setMob(null);
  };

  const changeOccupant = (e) => {
    const val = e.currentTarget.value;
    setOccupant(val);

    if (val === "obstacle" || val === "empty") {
      onEntitySelect(entity, null);
      setEntity(null);
      setMob(null);
    }

    if (val === "entity") {
      setMob(null);
    }

    if (val === "monster") {
      onEntitySelect(entity, null);
      setEntity(null);
    }
  };

  const onEntityChange = (e) => {
    setEntity(old => {
      onEntitySelect(old, e);

      return e;
    });
  };

  const onMonsterChange = async (e) => {
    setMob(e);

    if (e?.index) {
      try {
        const monster = await fetchFromCache('monsters', e.index);

        setMob({ ...e, ...monster });
      } catch (ex) {
        console.log(ex);
      }
    }
  };

  return (
    <div className="Row">
      <div className="Col">
        <h2>
          Add to Cell {AlphabetFromNum(selectedCell.x)}
          {selectedCell.y}
        </h2>

        <RadioGroup
          label={<strong>Occupant</strong>}
          onChange={changeOccupant}
          selectedValue={occupant}
        >
          <Radio label="Empty" value="empty" />
          <Radio label="Obstacle" value="obstacle" />
          <Radio label="Entity" value="entity" />
          <Radio label="Monster" value="monster" />
        </RadioGroup>

        <FormGroup>
          {occupant && occupant === "entity" && <Select
            items={entityLists}
            itemRenderer={EntitySelect}
            onItemSelect={onEntityChange}
            popoverProps={{ minimal: true, targetClassName: 'SelectDropdown' }}
          >
            <Button alignText="left" fill text={entity?.name || 'Select an Entity'} icon={IconNames.CARET_DOWN}></Button>  
          </Select>}

          {occupant && occupant === "monster" && <Select
            items={monsters}
            itemRenderer={EntitySelect}
            onItemSelect={onMonsterChange}
            popoverProps={{ minimal: true, targetClassName: 'SelectDropdown' }}
            itemPredicate={filterByName}
            initialContent={<div>Type to search 5e monsters</div>}
          >
            <Button alignText="left" fill text={mob?.name || 'Select a Monster (spooky!)'} icon={IconNames.CARET_DOWN}></Button>  
          </Select>}
        </FormGroup>
      </div>
    </div>
  );
};

export default CellForm;
