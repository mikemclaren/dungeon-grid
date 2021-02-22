export const CELL_INFO_KEY = "cells";

export const updateCell = (gridInfo = {}, x, y, fn = (d) => d) => {
  let newGridInfo = { ...gridInfo };

  if (!newGridInfo[CELL_INFO_KEY]) {
    newGridInfo[CELL_INFO_KEY] = {};
  }

  let cells = { ...newGridInfo[CELL_INFO_KEY] };
  const key = `${x}:${y}`;
  if (!cells[key]) {
    cells[key] = {
      x,
      y,
    };
  }

  cells[key] = fn(cells[key]);

  newGridInfo[CELL_INFO_KEY] = cells;
  return newGridInfo;
};

export const fetchCellData = (gridInfo = {}, x, y) => {
  const key = `${x}:${y}`;

  if (!gridInfo[CELL_INFO_KEY][key]) {
    return {
      x,
      y,
    };
  }

  return gridInfo[CELL_INFO_KEY][key];
};

export const cutAndPasteCell = (gridInfo = {}, fromX, fromY, toX, toY) => {
  const fromCell = fetchCellData(gridInfo, fromX, fromY);

  const info = {
    ...updateCell(gridInfo, toX, toY, () => {
      return {
        ...fromCell,
        x: toX,
        y: toY,
      };
    }),
  };

  return {
    ...updateCell(info, fromX, fromY, () => {
      return {
        x: fromX,
        y: fromY,
      }
    })
  };
};