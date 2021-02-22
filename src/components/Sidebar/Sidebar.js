import {
  Button,
  Classes,
  Icon,
  Intent,
  Menu,
  MenuItem,
  Position,
  Tree,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { EntityTypes } from "../../entities";

import "./Sidebar.css";

const { ipcRenderer } = window.require("electron");

const NewMenu = ({ closeDrawer = () => {} }) => {
  const [route, setRoute] = useState(null);

  const handleMenuClick = (r) => () => {
    closeDrawer();
    setRoute(r);
  };

  return (
    <Menu>
      {route && <Redirect to={route} />}
      <MenuItem
        icon={IconNames.NEW_GRID_ITEM}
        text="New Grid"
        onClick={handleMenuClick("/grid")}
      />
      <MenuItem
        icon={IconNames.NEW_PERSON}
        text="New Entity"
        onClick={handleMenuClick("/entity")}
      />
    </Menu>
  );
};

const Sidebar = ({ closeDrawer = () => {}, entities = [], grids = [] }) => {
  const [treeContents, setTreeContents] = useState([]);
  const [redirectToGrid, setRedirectToGrid] = useState(null);
  const [redirectToEntity, setRedirectToEntity] = useState(null);

  useEffect(() => {
    const tree = [
      {
        key: "grids000",
        id: "grids",
        icon: IconNames.GRID,
        hasCaret: true,
        label: "Grids",
        childNodes: grids.map((grid) => ({
          id: grid.gridId,
          key: grid.gridId,
          label: grid.name,
          icon: IconNames.MAP,
        })),
      },
      {
        key: "entities000",
        id: "entities",
        icon: IconNames.PERSON,
        hasCaret: true,
        label: "Entities",
        childNodes: entities.map((entity, i) => ({
          id: entity.entityId,
          key: entity.entityId,
          label: entity.name,
          icon:
            entity.type === EntityTypes.PLAYER
              ? IconNames.PERSON
              : IconNames.WALK,
          secondaryLabel: <span>{entity.type}</span>,
        })),
      },
    ];

    setTreeContents(tree);
  }, [entities, grids]);

  const handleNodeClick = (nodeData) => {
    if (!nodeData.childNodes) {
      if (nodeData.icon === IconNames.MAP) {
        setRedirectToGrid(nodeData.id);
        closeDrawer();
      } else {
        setRedirectToEntity(nodeData.id);
        closeDrawer();
      }
    }
  };

  const handleNodeExpand = (nodeData) => {
    const nodes = forEachNode(treeContents, (n) => {
      if (n.id === nodeData.id) {
        n.isExpanded = true;
      }
    });
    setTreeContents([].concat(nodes));
  };

  const handleNodeCollapse = (nodeData) => {
    const nodes = forEachNode(treeContents, (n) => {
      if (n.id === nodeData.id) {
        n.isExpanded = false;
      }
    });
    setTreeContents([].concat(nodes));
  };

  const forEachNode = (nodes, callback = () => {}) => {
    if (nodes == null) {
      return;
    }

    for (let node of nodes) {
      callback(node);
      node = forEachNode(node.childNodes, callback);
    }

    return nodes;
  };

  const deleteData = () => {
    return ipcRenderer.sendSync("wipeData");
  };

  return (
    <div>
      {redirectToGrid && <Redirect to={`/grid/${redirectToGrid}`} />}
      {redirectToEntity && <Redirect to={`/entity/${redirectToEntity}`} />}

      <h2>Create / Edit</h2>
      <Tree
        className={`${Classes.ELEVATION_0}`}
        contents={treeContents}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
        onNodeClick={handleNodeClick}
      />

      <div className="SideBarNewButtonWrapper">
        <Popover2
          content={<NewMenu closeDrawer={closeDrawer} />}
          inheritDarkTheme
          placement={Position.BOTTOM}
          minimal={false}
          usePortal
        >
          <Button
            icon={IconNames.PLUS}
            intent={Intent.PRIMARY}
            rightIcon={IconNames.CARET_DOWN}
          >
            Create New Things
          </Button>
        </Popover2>
      </div>

      <div className="SideBarNewButtonWrapper">
        <Button intent={Intent.WARNING} onClick={deleteData}>
          Delete all Data
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
