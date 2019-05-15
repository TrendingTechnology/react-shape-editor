import React, { Component } from 'react';
import { ShapeEditor, ImageLayer, DrawLayer, SelectionLayer } from '../src';
import RectShape from './RectShape';
import bgImage from './blank.png';

// if (process.env.NODE_ENV !== 'production') {
//   const { whyDidYouUpdate } = require('why-did-you-update');
//   whyDidYouUpdate(React, {
//     // include: [/^WrappedSh/],
//   });
// }

let iterator = 0;

function arrayReplace(arr, index, item) {
  return [
    ...arr.slice(0, index),
    ...(Array.isArray(item) ? item : [item]),
    ...arr.slice(index + 1),
  ];
}
const to5 = n => Math.floor(n / 5) * 5;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 0.75,
      items: [...new Array(100)].map((_, index) => ({
        id: String(index),
        x: Math.random() * 1500,
        y: Math.random() * 1500,
        width: 150,
        height: 125,
      })),
      selectedShapeIds: [],
      vectorWidth: 0,
      vectorHeight: 0,
    };

    this.constrainMove = this.constrainMove.bind(this);
    this.constrainResize = this.constrainResize.bind(this);
    this.onShapeChange = this.onShapeChange.bind(this);
    this.onShapeDelete = this.onShapeDelete.bind(this);
  }

  constrainMove({ x, y, width, height }) {
    const { vectorWidth, vectorHeight } = this.state;
    return {
      x: to5(Math.min(vectorWidth - width, Math.max(0, x))),
      y: to5(Math.min(vectorHeight - height, Math.max(0, y))),
    };
  }

  constrainResize({ movingCorner: { x: movingX, y: movingY } }) {
    const { vectorWidth, vectorHeight } = this.state;
    return {
      x: to5(Math.min(vectorWidth, Math.max(0, movingX))),
      y: to5(Math.min(vectorHeight, Math.max(0, movingY))),
    };
  }

  onShapeChange(newRect, shapeProps) {
    const item = this.state.items[shapeProps.shapeIndex];

    this.setState(state => ({
      items: arrayReplace(state.items, shapeProps.shapeIndex, {
        ...item,
        ...newRect,
      }),
    }));
  }

  onShapeDelete(event, shapeProps) {
    this.setState(state => ({
      items: arrayReplace(state.items, shapeProps.shapeIndex, []),
    }));
  }

  render() {
    const MIN_SCALE = 0.25;
    const MAX_SCALE = 4;

    const changeScale = ratio =>
      this.setState(state => ({
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.scale * ratio)),
      }));
    const {
      items,
      scale,
      selectedShapeIds,
      vectorWidth,
      vectorHeight,
    } = this.state;

    const selectedIdDict = selectedShapeIds.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});

    return (
      <div className="wrapper">
        <div className="navigation-wrapper">
          <a
            className="title"
            href="https://github.com/fritz-c/react-shape-editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Shape Editor
          </a>
          <a
            className="github-button"
            href="https://github.com/fritz-c/react-shape-editor"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            aria-label="Star fritz-c/react-shape-editor on GitHub"
          >
            Star
          </a>
        </div>
        <div className="description">
          Simple shape editor with React and SVG
        </div>
        <hr />
        <div style={{ marginLeft: 20 }}>
          <button type="button" onClick={() => changeScale(1 / Math.sqrt(2))}>
            -
          </button>
          <button type="button" onClick={() => changeScale(Math.sqrt(2))}>
            +
          </button>
        </div>
        <div
          style={{
            height: 400,
            marginLeft: 20,
            marginRight: 20,
            border: 'solid gray 2px',
            overflow: 'auto',
          }}
        >
          <ShapeEditor
            scale={scale}
            vectorWidth={vectorWidth}
            vectorHeight={vectorHeight}
          >
            <ImageLayer
              src={bgImage}
              onLoad={({ naturalWidth, naturalHeight }) => {
                this.setState({
                  vectorWidth: naturalWidth,
                  vectorHeight: naturalHeight,
                });
              }}
            />

            {/*
            <DrawLayer
              constrainMove={this.constrainMove}
              constrainResize={this.constrainResize}
              onAddShape={({ x, y, width, height }) => {
                this.setState(state => ({
                  items: [
                    ...state.items,
                    { id: `id${iterator}`, x, y, width, height },
                  ],
                }));
                iterator += 1;
              }}
            />
            */}

            <SelectionLayer
              selectedShapeIds={selectedShapeIds}
              onSelectionChange={ids =>
                this.setState({ selectedShapeIds: ids })
              }
            >
              {items.map((item, index) => {
                const { id, width, height, x, y, ...otherProps } = item;
                return (
                  <RectShape
                    key={id}
                    constrainMove={this.constrainMove}
                    constrainResize={this.constrainResize}
                    height={height}
                    keyboardTransformMultiplier={5}
                    onChange={this.onShapeChange}
                    onDelete={this.onShapeDelete}
                    shapeId={id}
                    shapeIndex={index}
                    width={width}
                    active={!!selectedIdDict[id]}
                    isInSelectionGroup={
                      selectedShapeIds.length >= 2 && !!selectedIdDict[id]
                    }
                    x={x}
                    y={y}
                    {...otherProps}
                  />
                );
              })}
            </SelectionLayer>
          </ShapeEditor>
        </div>
      </div>
    );
  }
}

export default App;
