import React from "react";

import { AlphabetFromNum } from "../../alphabet";
import { fetchCellData } from "../../cells";
import "./Grid.css";

const GridCell = ({
  x = 0,
  y = 0,
  isObstacled = false,
  onClick = () => {},
  selected = false,
}) => {
  const handleClick = () => {
    onClick(x, y);
  };

  return (
    <div
      className={`GridCell ${selected ? "GridCell--Selected" : ""}${
        isObstacled ? " GridCell--Obstacled" : ""
      }`}
      key={x}
      onClick={handleClick}
    >
      <span className="GridCoord">
        {AlphabetFromNum(x)}
        {y}
      </span>
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
      {[...Array(height).keys()].map((num) => (
        <div key={num} className="GridRow">
          <div className="GridCell GridHeader">
            <span>{num}</span>
          </div>
          {[...Array(width).keys()].map((w) => (
            <GridCell
              x={w}
              y={num}
              onClick={onCellClick}
              selected={selectedCell.x === w && selectedCell.y === num}
              {...fetchCellData(gridInfo, w, num)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
