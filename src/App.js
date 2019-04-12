import React, { Component } from 'react';
import ShapeEditor from './ShapeEditor';
import SingleLineShape from './SingleLineShape';
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
      items: [...new Array(50)].map((_, index) => ({
        id: index,
        x: Math.random() * 1500,
        y: Math.random() * 1500,
        width: 150,
        height: 125,
      })),
    };
  }

  render() {
    const MIN_SCALE = 0.25;
    const MAX_SCALE = 4;

    const changeScale = ratio =>
      this.setState(state => ({
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.scale * ratio)),
      }));
    const { scale, items } = this.state;
    const to5 = n => Math.floor(n / 5) * 5;

    return (
      <div>
        <button onClick={() => changeScale(1 / Math.sqrt(2))}>-</button>
        <button onClick={() => changeScale(Math.sqrt(2))}>+</button>

        <div
          style={{
            height: 400,
            margin: 20,
            border: 'solid gray 2px',
            overflow: 'auto',
          }}
        >
          <ShapeEditor
            planeImageSrc={bgImage}
            scale={scale}
            onAddShape={({ x, y, width, height }) => {
              this.setState(state => ({
                items: [
                  ...state.items,
                  { id: `id${iterator}`, x, y, width, height },
                ],
              }));
              iterator += 1;
            }}
            constrainMove={({
              x,
              y,
              width,
              height,
              planeWidth,
              planeHeight,
            }) => {
              return {
                x: to5(Math.min(planeWidth - width, Math.max(0, x))),
                y: to5(Math.min(planeHeight - height, Math.max(0, y))),
              };
            }}
            constrainResize={({
              startCorner: { x: startX, y: startY },
              movingCorner: { x: movingX, y: movingY },
              planeWidth,
              planeHeight,
            }) => {
              return {
                x: to5(Math.min(planeWidth, Math.max(0, movingX))),
                y: to5(Math.min(planeHeight, Math.max(0, movingY))),
              };
            }}
          >
            {items.map((item, index) => {
              const { id, width, height, x, y, type, ...otherProps } = item;
              return (
                <SingleLineShape
                  key={id}
                  width={width}
                  height={height}
                  x={x}
                  y={y}
                  keyboardTransformMultiplier={5}
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
