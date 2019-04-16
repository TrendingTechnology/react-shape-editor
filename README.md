# React Shape Editor

Simple shape editor component

Todo

- Focus on last available node after deleting
- Grid preview for demo
- Restore focus logic to IE11: https://allyjs.io/tutorials/focusing-in-svg.html#focusing-svg-elements

## Usage

```jsx
import React from 'react';
import {
  ShapeEditor,
  ImageLayer,
  DrawLayer,
  wrapShape,
} from 'react-shape-editor';

function arrayReplace(arr, index, item) {
  return [
    ...arr.slice(0, index),
    ...(Array.isArray(item) ? item : [item]),
    ...arr.slice(index + 1),
  ];
}

const RectShape = wrapShape(({ width, height, scale }) => {
  const strokeWidth = 2 / scale;
  return (
    <rect
      width={Math.max(0, width - strokeWidth)}
      height={Math.max(0, height - strokeWidth)}
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      fill="rgba(0,0,255,0.5)"
      stroke="rgba(0,0,255,0.9)"
      strokeWidth={strokeWidth}
    />
  );
});

let idIterator = 1;
export default class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 0.75,
      items: [
        { id: 1, x: 20, y: 50, width: 50, height: 25 },
        { id: 2, x: 120, y: 0, width: 20, height: 75 },
      ],
      vectorWidth: 0,
      vectorHeight: 0,
    };
  }

  render() {
    const { scale, items, vectorWidth, vectorHeight } = this.state;

    return (
      <div style={{ height: 400 }}>
        <ShapeEditor
          scale={scale}
          vectorWidth={vectorWidth}
          vectorHeight={vectorHeight}
        >
          <ImageLayer
            src="https://raw.githubusercontent.com/fritz-c/react-shape-editor/d8661b46d07d832e316aacc906a0d603a3bb13a2/website/blank.png"
            onLoad={({ naturalWidth, naturalHeight }) => {
              this.setState({
                vectorWidth: naturalWidth,
                vectorHeight: naturalHeight,
              });
            }}
          />
          <DrawLayer
            onAddShape={({ x, y, width, height }) => {
              this.setState(state => ({
                items: [
                  ...state.items,
                  { id: `id${idIterator}`, x, y, width, height },
                ],
              }));
              idIterator += 1;
            }}
          />
          {items.map((item, index) => {
            const { id, height, width, x, y, ...otherProps } = item;
            return (
              <RectShape
                key={id}
                height={height}
                width={width}
                x={x}
                y={y}
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
    );
  }
}
```
