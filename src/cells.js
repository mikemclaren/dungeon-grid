export const CELL_INFO_KEY = "cells";

export const updateCell = (
  gridInfo = {},
  x,
  y,
  fn = (d) => {
    return d;
  }
) => {
  const newGridInfo = Object.assign({}, gridInfo);
  if (!newGridInfo[CELL_INFO_KEY]) {
    newGridInfo[CELL_INFO_KEY] = [];
  }

  const cells = newGridInfo[CELL_INFO_KEY];

  if (!cells[x]) {
    cells[x] = [];
  }

  if (!cells[x][y]) {
    cells[x][y] = {
      x,
      y,
    };
  }

  cells[x][y] = fn(cells[x][y]);
  newGridInfo.cells = [].concat(cells);

  return newGridInfo;
};

export const fetchCellData = (gridInfo = {}, x, y) => {
  if (
    !gridInfo[CELL_INFO_KEY] ||
    !gridInfo[CELL_INFO_KEY][x] ||
    !gridInfo[CELL_INFO_KEY][x][y]
  ) {
    return {
      x,
      y,
    };
  }

  //console.log(gridInfo[CELL_INFO_KEY]);

  return gridInfo[CELL_INFO_KEY][x][y];
};
