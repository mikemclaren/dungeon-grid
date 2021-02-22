import { Menu, MenuItem } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import keyboardjs from "keyboardjs";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cutAndPasteCell, fetchCellData, updateCell } from "../../cells";
import { EntitySizes } from "../../entities";
import useZoom from "../../hooks/useZoom";
import Grid from "../Grid/Grid";

import "./PlayScreen.css";

const { ipcRenderer } = window.require("electron");

const PlayScreen = ({
  grids = []
}) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [, setLastMove] = useState({});
  const [gridInfo, setGridInfo] = useState({});
  const [zoom] = useZoom();

  const { gridId } = useParams();

  useEffect(() => {
    for (let i = 0; i < grids.length; i++) {
      if (grids[i].gridId === parseInt(gridId)) {
        setGridInfo((info) => {
          if (info.gridId !== parseInt(gridId)) {
            return grids[i];
          }

          return info;
        });

        setLastMove((info) => {
          if (!info || info.gridId !== parseInt(gridId)) {
            return grids[i];
          }

          return info;
        });
      }
    }
  }, [grids, gridId]);


  const saveGrid = useCallback(async () => {
    await ipcRenderer.invoke("saveGrid", gridInfo);
  }, [gridInfo]);

  const moveSelectedCell = useCallback((xShift, yShift) => {
    if (selectedCell) {
      const destX = selectedCell.x + xShift;
      const destY = selectedCell.y + yShift;

      setGridInfo((info) => {
        if (destX < 0 || destX > info.width) {
          return info;
        }
    
        if (destY < 0 || destY > info.height) {
          return info;
        }

        const cell = fetchCellData(info, selectedCell.x, selectedCell.y);
  
        const size = EntitySizes[cell?.monster?.size] || EntitySizes[cell?.entity?.size] || 1;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const destination = fetchCellData(info, destX + i, destY + j);
            if (destination.x !== selectedCell.x || destination.y !== selectedCell.y) {
              if (destination?.isObstacled || destination?.monster?.name || destination?.entity?.name) {
                return info;
              }  
            }
          }
        }
    
        const newGrid = cutAndPasteCell(info, selectedCell.x, selectedCell.y, destX, destY);

        setSelectedCell(selected => {
          if (selected) {
            return {
              ...fetchCellData(gridInfo, selected.x, selected.y),
              x: destX,
              y: destY,
            };  
          }
    
          return null;
        });
        return newGrid;
      });
    }
  }, [gridInfo, selectedCell]);

  useEffect(() => {
    keyboardjs.bind('e', () => {
      setSelectedCell(null);
    });

    keyboardjs.bind('backspace', () => {
      setLastMove((move) => {
        if (move) {
          setGridInfo(move);
        }
      });

      setSelectedCell(null);
    });

    keyboardjs.bind('command+s', () => {
      saveGrid();
    });

    keyboardjs.bind('command+left', (e) => {
      e.preventRepeat();
      moveSelectedCell(-1, 0);
    });

    keyboardjs.bind('command+right', (e) => {
      e.preventRepeat();
      moveSelectedCell(1, 0);
    });

    keyboardjs.bind('command+up', (e) => {
      e.preventRepeat();
      moveSelectedCell(0, -1);
    });

    keyboardjs.bind('command+down', (e) => {
      e.preventRepeat();
      moveSelectedCell(0, 1);
    });

    const interval = setInterval(saveGrid, 60 * 1000);

    return () => {
      keyboardjs.unbind('e');
      keyboardjs.unbind('command+left');
      keyboardjs.unbind('command+right');
      keyboardjs.unbind('command+up');
      keyboardjs.unbind('command+down');
      keyboardjs.unbind('backspace');
      keyboardjs.unbind('command+s');
      clearInterval(interval);
    };
  }, [saveGrid, moveSelectedCell]);

  const onCellClick = (x, y) => {
    if (!selectedCell) {
      setSelectedCell({
        ...fetchCellData(gridInfo, x, y),
        actuallyExists: true
      });
    } else if (selectedCell.x === x && selectedCell.y === y) {
      setSelectedCell(null);
      return;
    } else {
      setLastMove(gridInfo);

      if (selectedCell.entity?.name || selectedCell.monster?.name) {
        const destination = fetchCellData(gridInfo, x, y);

        // can't move to a cell already occupied
        if (destination.isObstacled || destination.entity?.name || destination.monster?.name) {
          setSelectedCell({
            ...destination,
            actuallyExists: true
          });
          return;
        }

        // we move the entity or monster to the space
        // we do this by updating the destination with the selectedCell
        // info, wipe the selectedCell's spot, and then changing the
        // selectedCell to the new cell.
        setGridInfo((info) => {
          let i = Object.assign(
            {},
            updateCell(info, x, y, (d) => {
              return {
                ...selectedCell,
                x, y
              };
            }),
          );

          i = Object.assign({}, updateCell(i, selectedCell.x, selectedCell.y, (d) => {
            return {
              x: selectedCell.x, y: selectedCell.y
            };
          }));

          setSelectedCell({
            ...fetchCellData(i, x, y),
            actuallyExists: true,
          });

          return i;
        });

        return;
      }

      setSelectedCell({
        ...fetchCellData(gridInfo, x, y),
        actuallyExists: true
      });
    }
  };

  const addObstacle = (x, y) => () => {
    setGridInfo((info) => {
      return {
        ...updateCell(info, x, y, (d) => {
          d.isObstacled = true;

          return d;
        })
      };
    });
  };

  const removeObstacle = (x, y) => () => {
    setGridInfo((info) => {
      return {
        ...updateCell(info, x, y, (d) => {
          d.isObstacled = false;

          return d;
        })
      };
    });
  };

  const makeBloody = (x, y, bloody) => () => {
    setGridInfo((info) => {
      return {
        ...updateCell(info, x, y, (d) => {
          const type = d.entity ? 'entity' : 'monster';
          if (d[type]) {
            d[type].isBloody = bloody;

            if (!bloody) {
              delete d[type].isBloody;
            }
          }

          return d;
        })
      };
    });
  };

  const makeDead = (x, y, dead) => () => {
    setGridInfo((info) => {
      return {
        ...updateCell(info, x, y, (d) => {
          const type = d.entity ? 'entity' : 'monster';
          if (d[type]) {
            d[type].isDead = dead;
            d[type].isBloody = dead ? false : d[type].isBloody;

            if (!dead) {
              delete d[type].isDead;
            }
          }

          return d;
        })
      };
    });
  };

  const generateRightClickMenu = ({
    x, y, isObstacled, selected, entity, monster
  }) => {
    const noPeeps = !entity?.name && !monster?.name;
    const empty = !isObstacled && noPeeps;
    const dead = (monster?.isDead || entity?.isDead);
    const isBloody = (monster?.isBloody || entity?.isBloody);

    return (
      <Menu>
        {empty && <MenuItem icon={IconNames.CUBE} text="Add Obstacle" onClick={addObstacle(x, y)} />}
        {isObstacled && <MenuItem icon={IconNames.CUBE_REMOVE} text="Remove Obstacle" onClick={removeObstacle(x, y)} />}
        {!noPeeps && !dead && !isBloody && <MenuItem icon={IconNames.WARNING_SIGN} text="Make Bloody" onClick={makeBloody(x, y, true)} />}
        {!noPeeps && !dead && isBloody && <MenuItem icon={IconNames.DIAGNOSIS} text="Heal" onClick={makeBloody(x, y, false)} />}
        {!noPeeps && !dead && <MenuItem icon={IconNames.CUT} text="Make Dead" onClick={makeDead(x, y, true)} />}
        {!noPeeps && dead && <MenuItem icon={IconNames.CLEAN} text="Make Not Dead" onClick={makeDead(x, y, false)} />}
      </Menu>
    );
  };

  return (
    <div>
      <div className="PlayScreen__GridWrapper">
        <Grid
          onCellClick={onCellClick}
          rightClickMenuGenerator={generateRightClickMenu}
          width={gridInfo.width}
          height={gridInfo.height}
          gridInfo={gridInfo}
          selectedCell={selectedCell}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default PlayScreen;