import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ContextMenu2 } from "@blueprintjs/popover2";
import { EntitySizes } from "../../../entities";

import "./GridEntity.css";

const calculateNameInits = (name) => {
  const split = name.split(' ');
  let secondInit = split[split.length-1];
  if (split.length < 2) {
    secondInit = '';
  } else {
    secondInit = secondInit[0];
  }

  return `${name[0]}${secondInit}`.toUpperCase();
};

const GridEntity = ({
  entity = {},
  monster = {},
  x,
  y,
  rightClickMenuGenerator,
  onClick = () => {},
  selected = false,
  isObstacled = false,
}) => {
  const handleClick = () => {
    onClick(x, y);
  };

  const style = {
    left: `${(x + 1) * 5}em`,
    top: `${(y + 1) * 5}em`,
  };

  if (monster?.size) {
    style.width = `${EntitySizes[monster.size] * 5}em`; 
    style.maxWidth = `${EntitySizes[monster.size] * 5}em`;

    style.height = `${EntitySizes[monster.size] * 5}em`; 
    style.maxHeight = `${EntitySizes[monster.size] * 5}em`;
  }

  let className = `GridEntity__Wrapper ${(entity?.isDead || monster?.isDead) ? " GridEntity--Dead" : ""}${monster?.name ? " GridEntity--Enemy" : "" }`;

  if (selected) {
    className = `${className} GridEntity__Selected`;
  }

  if (entity?.name) {
    className = `${className} GridEntity--${entity.type}`;
  }

  const internals = <div>
    {entity?.name && <span className="GridInits">
      {calculateNameInits(entity.name)}  
    </span>}
    {monster?.name && <span className="GridInits">
      {calculateNameInits(monster.name)}  
    </span>}

    {(entity?.isDead || monster?.isDead) && <span className="GridDead"><Icon icon={IconNames.CROSS} iconSize={Icon.SIZE_LARGE} /></span>}
    {(entity?.isBloody || monster?.isBloody) && <span className="GridBloody"><Icon icon={IconNames.WARNING_SIGN} iconSize={Icon.SIZE_STANDARD} /></span>}
  </div>;

  if (rightClickMenuGenerator && typeof rightClickMenuGenerator === 'function') {
    return (
      <div
        className={className}
        key={x}
        onClick={handleClick}
        style={style}
      >
        <ContextMenu2 key={x} content={rightClickMenuGenerator({x, y, isObstacled, selected, entity, monster})}>
          {internals}
        </ContextMenu2>
      </div>
    );
  }

  return (
    <div
      className={className}
      key={x}
      onClick={handleClick}
      style={style}
    >
      {internals}
    </div>
  );
};

export default GridEntity;
