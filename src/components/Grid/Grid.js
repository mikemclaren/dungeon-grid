import React from "react";
import { Hotkey, Hotkeys, HotkeysTarget } from "@blueprintjs/core";
import { useState } from "react";
import { AlphabetFromNum } from "../../alphabet";
import "./Grid.css";

const GridCell = ({ x = 0, y = 0 }) => {
  return (
    <div className="GridCell" key={x}>
      <span className="GridCoord">
        {AlphabetFromNum(x)}
        {y}
      </span>
    </div>
  );
};

@HotkeysTarget
class Grid extends React.Component {
  state = {
    zoom: 5,
  };

  zoomOut() {
    this.setState((state) => {
      if (state.zoom > 0) {
        return {
          zoom: state.zoom - 1,
        };
      }
    });
  }

  zoomIn() {
    this.setState((state) => {
      if (state.zoom < 5) {
        return {
          zoom: state.zoom + 1,
        };
      }
    });
  }

  renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey label="Zoom out" combo="minus" onKeyDown={this.zoomIn} />
        <Hotkey label="Zoom out" combo="plus" onKeyDown={this.zoomOut} />
      </Hotkeys>
    );
  }

  render() {
    return (
      <div className={`GridWrapper GridZoom${this.state.zoom}`}>
        <div className="GridHeaderRow GridRow">
          <div className="GridCell GridHeader" />
          {[...Array(this.props.width).keys()].map((num) => (
            <div className="GridCell GridHeader" key={num}>
              <span>{AlphabetFromNum(num)}</span>
            </div>
          ))}
        </div>
        {[...Array(this.props.height).keys()].map((num) => (
          <div key={num} className="GridRow">
            <div className="GridCell GridHeader">
              <span>{num}</span>
            </div>
            {[...Array(this.props.width).keys()].map((w) => (
              <GridCell x={w} y={num} />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default Grid;
