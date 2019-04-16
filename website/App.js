import React, { Component } from 'react';
import { ShapeEditor, ImageLayer, DrawLayer } from '../src';
import RectShape from './RectShape';
import bgImage from './blank.png';

let iterator = 0;

function arrayReplace(arr, index, item) {
  return [
    ...arr.slice(0, index),
    ...(Array.isArray(item) ? item : [item]),
    ...arr.slice(index + 1),
  ];
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 0.75,
      items: [...new Array(100)].map((_, index) => ({
        id: index,
        x: Math.random() * 1500,
        y: Math.random() * 1500,
        width: 150,
        height: 125,
      })),
      vectorWidth: 0,
      vectorHeight: 0,
    };
  }

  render() {
    const MIN_SCALE = 0.25;
    const MAX_SCALE = 4;

    const changeScale = ratio =>
      this.setState(state => ({
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.scale * ratio)),
      }));
    const { scale, items, vectorWidth, vectorHeight } = this.state;
    const to5 = n => Math.floor(n / 5) * 5;

    const constrainMove = ({ x, y, width, height }) => ({
      x: to5(Math.min(vectorWidth - width, Math.max(0, x))),
      y: to5(Math.min(vectorHeight - height, Math.max(0, y))),
    });
    const constrainResize = ({ movingCorner: { x: movingX, y: movingY } }) => ({
      x: to5(Math.min(vectorWidth, Math.max(0, movingX))),
      y: to5(Math.min(vectorHeight, Math.max(0, movingY))),
    });

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
            <DrawLayer
              constrainMove={constrainMove}
              constrainResize={constrainResize}
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
            {items.map((item, index) => {
              const { id, width, height, x, y, ...otherProps } = item;
              return (
                <RectShape
                  key={id}
                  width={width}
                  height={height}
                  x={x}
                  y={y}
                  keyboardTransformMultiplier={5}
                  constrainMove={constrainMove}
                  constrainResize={constrainResize}
                  onChange={newRect => {
                    this.setState(state => ({
                      items: arrayReplace(state.items, index, {
                        ...item,
                        ...newRect,
                      }),
                    }));
                  }}
                  onDelete={() => {
                    this.setState(state => ({
                      items: arrayReplace(state.items, index, []),
                    }));
                  }}
                  {...otherProps}
                />
              );
            })}
          </ShapeEditor>
        </div>
      </div>
    );
  }
}

export default App;
