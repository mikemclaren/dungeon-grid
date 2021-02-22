import React from "react";

import { ContextMenu2 } from "@blueprintjs/popover2";

import { AlphabetFromNum } from "../../alphabet";
import { fetchCellData } from "../../cells";
import "./Grid.css";
import GridEntity from "./GridEntity";

const GridCell = ({
  x = 0,
  y = 0,
  isObstacled = false,
  onClick = () => {},
  selected = false,
  entity = {},
  monster = {},
  rightClickMenuGenerator,
}) => {
  const handleClick = () => {
    onClick(x, y);
  };

  let className = `GridCell ${selected ? "GridCell--Selected" : ""}${
    isObstacled ? " GridCell--Obstacled" : ""
  }`;

  const internals = <div>    
    {!entity?.name && !monster?.name && !isObstacled && <span className="GridCoord">
      {AlphabetFromNum(x)}
      {y}
    </span>}
  </div>;

  if (rightClickMenuGenerator && typeof rightClickMenuGenerator === 'function') {
    return (
      <div
        className={className}
        key={x}
        onClick={handleClick}
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
    >
      {internals}
    </div>
  );
};

const Grid = ({
  width = 0,
  height = 0,
  zoom = 5,
  onCellClick = () => {},
  selectedCell = {},
  gridInfo = {},
  rightClickMenuGenerator
}) => {
  return (
    <div className={`GridWrapper GridZoom${zoom}`}>
      <div className="GridHeaderRow GridRow">
        <div className="GridCell GridHeader" />
        {[...Array(width).keys()].map((num) => (
          <div className="GridCell GridHeader" key={num}>
            <span>{AlphabetFromNum(num)}</span>
          </div>
        ))}
      </div>

      <div className="Grid__InnerWrapper">
      {[...Array(height).keys()].map((num) => (
        <div key={num} className="GridRow">
          <div className="GridCell GridHeader">
            <span>{num}</span>
          </div>
          {[...Array(width).keys()].map((w) => {
            const props = fetchCellData(gridInfo, w, num);
            const arr = [<GridCell
              x={w}
              y={num}
              onClick={onCellClick}
              selected={selectedCell?.x === w && selectedCell?.y === num}
              {...props}
              rightClickMenuGenerator={((selectedCell?.x === w && selectedCell?.y === num) || props.entity?.name || props.monster?.name) ? rightClickMenuGenerator : null}
            />];

            if (props?.entity?.name || props?.monster?.name) {
              arr.push(<GridEntity
                x={w}
                y={num}
                onClick={onCellClick}
                selected={selectedCell?.x === w && selectedCell?.y === num}
                {...props}
                rightClickMenuGenerator={rightClickMenuGenerator}  
              />);
            }

            return arr;
          })}
        </div>
      ))}
      </div>
    </div>
  );
};

export default Grid;
