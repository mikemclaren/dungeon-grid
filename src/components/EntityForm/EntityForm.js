import {
  Button,
  FormGroup,
  InputGroup,
  Intent,
  MenuItem,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { useEffect, useState } from "react";
import { EntityTypes } from "../../entities";

import { results as races } from "../../data/races.json";
import { results as monsters } from "../../data/monsters.json";
import { useParams } from "react-router-dom";

import "./EntityForm.css";

const { ipcRenderer } = window.require("electron");

const combined = [].concat(races, monsters);

const entityTypes = Object.keys(EntityTypes).map((key) => ({
  value: EntityTypes[key],
  name: EntityTypes[key],
}));

const filterByName = (query, item) => {
  if (item.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
    return true;
  }

  return false;
};

const EntitySelect = (entity, { handleClick, modifiers }) => {
  return (
    <MenuItem
      onClick={handleClick}
      active={modifiers.active}
      key={entity.index}
      text={entity.name}
    />
  );
};

const EntityForm = ({ entities = [] }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Enemy");
  const [race, setRace] = useState("dragonborn");
  const [raceOrMonster, setRaceOrMonster] = useState("aboleth");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [size, setSize] = useState("Medium");
  const [entityInfo, setEntityInfo] = useState({});

  const { entityId } = useParams();

  useEffect(() => {
    if (saving) {
      setSaved(true);

      const timeout = setTimeout(() => {
        setSaved(false);
      }, 5000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [saving]);

  useEffect(() => {
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].entityId === parseInt(entityId)) {
        setEntityInfo(entities[i]);
        setType(entities[i].type);
        setName(entities[i].name);

        if (entities[i].race) {
          setRace(entities[i].race);
        }

        if (entities[i].raceOrMonster) {
          setRaceOrMonster(entities[i].raceOrMonster);
        }
      }
    }
  }, [entities, entityId]);

  const onNameChange = (e) => {
    const val = e.target.value;

    setName(val);
  };

  const onTypeChange = (e) => {
    setType(e.value);
  };

  const onRaceChange = (e) => {
    setRace(e.index);
  };

  const onRaceOrMonsterChange = (e) => {
    setRaceOrMonster(e.index);
  };

  const changeSize = (e) => {
    const val = e.currentTarget.value;

    setSize(val);
  }

  const saveEntity = async () => {
    setSaving(true);

    if (!entityInfo.entityId) {
      entityInfo.entityId = Date.now();
    }

    entityInfo.name = name;
    entityInfo.type = type;

    if (type === EntityTypes.PLAYER) {
      entityInfo.race = race;
    } else {
      entityInfo.raceOrMonster = raceOrMonster;
    }

    await ipcRenderer.sendSync("saveEntity", entityInfo);
    setEntityInfo(entityInfo);
    setSaving(false);
  };

  const calculateNameInits = (name) => {
    const split = name.split(' ');
    const secondInit = split[split.length-1];
    return `${name[0]}${secondInit[0]}`.toUpperCase();
  };

  return ([
    <div className="FormWrapper">
      <h1>
        {!entityId && 'New Entity'}
        {entityId && entityInfo.name}
      </h1>

      <div className="Row">
        <div className="Col">
          <FormGroup label="Type">
            <Select
              items={entityTypes}
              itemRenderer={EntitySelect}
              onItemSelect={onTypeChange}
              filterable={false}
              popoverProps={{ minimal: true, targetClassName: 'SelectDropdown--EntityType' }}
            >
              <Button alignText="left" fill text={type} icon={IconNames.CARET_DOWN}></Button>
            </Select>
          </FormGroup>
        </div>
        <div className="Col3">
          <FormGroup label="Name" labelFor="entity-name">
            <InputGroup
              leftIcon={IconNames.EDIT}
              id="entity-name"
              placeholder="Choose a name, keep it real, bro"
              onChange={onNameChange}
              defaultValue={name === "" ? null : name}
            />
          </FormGroup>
        </div>
      </div>

      <div className="Row">
      {type === EntityTypes.PLAYER && (
        <div className="Col">
          <FormGroup label="Race">
            <Select
              itemPredicate={filterByName}
              items={races}
              itemRenderer={EntitySelect}
              onItemSelect={onRaceChange}
              popoverProps={{ minimal: true, targetClassName: 'SelectDropdown--EntityMonster' }}
            >
              <Button
                alignText="left"
                text={races.find((v) => v.index === race).name}
                icon={IconNames.CARET_DOWN}
              ></Button>
            </Select>
          </FormGroup>
        </div>
      )}

      {(type === EntityTypes.ENEMY || type === EntityTypes.NPC) && (
        <div className="Col">
          <FormGroup label="Monster / Race">
            <Select
              itemPredicate={filterByName}
              items={combined}
              itemRenderer={EntitySelect}
              onItemSelect={onRaceOrMonsterChange}
              popoverProps={{ minimal: true, targetClassName: 'SelectDropdown--EntityMonster' }}
              initialContent={<div>Type to search 5e monsters and races</div>}
            >
              <Button
                alignText="left"
                text={combined.find((v) => v.index === raceOrMonster).name}
                icon={IconNames.CARET_DOWN}
                fill
              ></Button>
            </Select>
          </FormGroup>
        </div>
      )}
      </div>

      <div className="Row">
        <div className="Col">
          <RadioGroup
            label={<strong>Size</strong>}
            onChange={changeSize}
            selectedValue={size}
          >
            <Radio label="Tiny" value="Tiny" />
            <Radio label="Small" value="Small" />
            <Radio label="Medium" value="Medium" />
            <Radio label="Large" value="Large" />
            <Radio label="Huge" value="Huge" />
            <Radio label="Gargantuan" value="Gargantuan" />
          </RadioGroup>
        </div>
      </div>

      <div className="Row">
        <div className="Col">
          <Button
            disabled={saving}
            onClick={saveEntity}
            icon={!saved ? IconNames.UPLOAD : IconNames.SAVED}
            intent={Intent.SUCCESS}
            large
            fill
          >{!saved ? 'Save' : 'Saved'}</Button>
        </div>
      </div>
    </div>,
    <div className="EntityGridLook">
      <h3>Grid Look</h3>
      {name && name.length > 0 && <div className={`EntityGridCell EntityGridCell--${type}`}>
        <span>{calculateNameInits(name)}</span>
      </div>}
    </div>
  ]);
};

export default EntityForm;
