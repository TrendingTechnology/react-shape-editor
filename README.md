# React Shape Editor

Simple shape editor component

[![shape-editor](https://user-images.githubusercontent.com/4413963/59026651-eb403580-8891-11e9-9fea-33843b6386c0.gif)](https://fritz-c.github.io/react-shape-editor/)

[![CircleCI](https://circleci.com/gh/fritz-c/react-shape-editor.svg?style=svg)](https://circleci.com/gh/fritz-c/react-shape-editor)

## Components

### ShapeEditor

The wrapper for the entire editor component. Contains the `<svg>` element.

| Prop          |        Type         | Default | <div style="width: 400px;">Description</div>                                                                                                               |
| :------------ | :-----------------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children      | renderable elements | `null`  | Will include components such as `wrapShape`-wrapped shapes, other library components (`SelectionLayer`/`ImageLayer`/`DrawLayer`) or arbitrary SVG elements |
| focusOnAdd    |       `bool`        | `true`  | If `true`, focus on newly created elements.                                                                                                                |
| focusOnDelete |       `bool`        | `true`  | If `true`, focus on the next-closest element after a shape is deleted.                                                                                     |
| scale         |      `number`       |   `1`   | Scale factor of the svg contents. For example, given a `vectorWidth` of `100` and a scale of `0.5`, the rendered DOM element will be 50 px wide.           |
| style         |      `object`       |  `{}`   | Style to apply to the `<svg>` element.                                                                                                                     |
| vectorHeight  |      `number`       |   `0`   | Height of the `<svg>` element viewBox.                                                                                                                     |
| vectorWidth   |      `number`       |   `0`   | Width of the `<svg>` element viewBox.                                                                                                                      |

---

### ImageLayer

Renders an svg image element.

| Prop                 |   Type   | Default  | <div style="width: 400px;">Description</div>                                                        |
| :------------------- | :------: | :------: | :-------------------------------------------------------------------------------------------------- |
| src<br/>_(required)_ | `string` |          | URL for the image to display.                                                                       |
| onLoad               |  `func`  | `()=>{}` | Callback for the image load. Signature: `({ naturalWidth: number, naturalHeight: number }) => void` |

---

### wrapShape (HOC)

When used to wrap an SVG element, enables resize and movement functionality.

**Usage**

```js
const WrappedRect = wrapShape(({ height, width /* ... "wrapShape Props Received" */ }) => (
  <rect fill="blue" height={height} width={width} />
))

// later, in render()

<WrappedRect
  shapeId={myId}
  x={12}
  y={56}
  width={20}
  /* ... "WrappedShape Props" */
/>
```

**wrapShape Props Received**

| Prop           |   Type   | <div style="width: 400px;">Description</div>                                                                                                   |
| :------------- | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| height         | `number` | Height of the shape.                                                                                                                           |
| width          | `number` | Width of the shape.                                                                                                                            |
| disabled       |  `bool`  | If `true`, the shape cannot be moved or resized, and shows no resize handles.                                                                  |
| isBeingChanged |  `bool`  | If `true`, the shape is currently being moved or scaled.                                                                                       |
| scale          | `number` | Scale of the parent `<svg>` element, provided so you can render strokes or other components that maintain a constant size at every zoom level. |

**WrappedShape Props**

| Prop                        |    Type     |                                Default                                | <div style="width: 400px;">Description</div>                                                                                                                                                                                                                                                                                                   |
| :-------------------------- | :---------: | :-------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| height<br/>_(required)_     |  `number`   |                                                                       | Height of the shape.                                                                                                                                                                                                                                                                                                                           |
| shapeId<br/>_(required)_    |  `string`   |                                                                       | Unique identifier for the shape, to aid in data handling.                                                                                                                                                                                                                                                                                      |
| width<br/>_(required)_      |  `number`   |                                                                       | Width of the shape.                                                                                                                                                                                                                                                                                                                            |
| x<br/>_(required)_          |  `number`   |                                                                       | x-axis offset of the shape.                                                                                                                                                                                                                                                                                                                    |
| y<br/>_(required)_          |  `number`   |                                                                       | y-axis offset of the shape.                                                                                                                                                                                                                                                                                                                    |
| active                      |   `bool`    |                                `false`                                | If `true`, the shape is rendered as focused (particularly important when using a `SelectionLayer`). When not using a selection layer, this prop can be left unset, as native HTML focus will handle focus state.                                                                                                                               |
| constrainMove               |   `func`    |                       non-constraining function                       | A callback for restricting movement during shape transformations (e.g., to lock movement to one axis or snap it to a grid). Signature: `({ originalX: number, originalY: number, x: number, y: number, width: number, height: number }) => ({ x: number, y: number })`                                                                         |
| constrainResize             |   `func`    |                       non-constraining function                       | A callback for restricting resizing during shape transformations (e.g., to lock resizing to one axis or snap it to a grid). Signature: `({ originalMovingCorner: { x: number, y: number }, startCorner: { x: number, y: number }, movingCorner: { x: number, y: number }, lockedDimension: one of "x" or "y" }) => ({ x: number, y: number })` |
| disabled                    |   `bool`    |                                `false`                                | If `true`, the shape cannot be moved or resized, and shows no resize handles.                                                                                                                                                                                                                                                                  |
| isInSelectionGroup          |   `bool`    |                                `false`                                |                                                                                                                                                                                                                                                                                                                   |
| keyboardTransformMultiplier |  `number`   |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| onBlur                      |   `func`    |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| onChange                    |   `func`    |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| onDelete                    |   `func`    |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| onFocus                     |   `func`    |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| onKeyDown                   |   `func`    |                                  `0`                                  |                                                                                                                                                                                                                                                                                                                   |
| ResizeHandleComponent       | `Component` | [`DefaultResizeHandleComponent`](src/DefaultResizeHandleComponent.js) |                                                                                                                                                                                                                                                                                                                   |
| wrapperProps                |  `object`   |                                 `{}`                                  |                                                                                                                                                                                                                                                                                                                   |

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
        { id: '1', x: 20, y: 50, width: 50, height: 25 },
        { id: '2', x: 120, y: 0, width: 20, height: 75 },
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
                shapeId={id}
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

## Contributing

After cloning the repository and running `npm install` inside, you can use the following commands to develop and build the project.

```sh
# Starts a dev server that hosts a demo page with the component.
npm start

# Runs the library tests
npm test

# Lints the code with eslint
npm run lint

# Lints and builds the code, placing the result in the dist directory.
# This build is necessary to reflect changes if you're
#  `npm link`-ed to this repository from another local project.
npm run build
```

Pull requests are welcome!

## License

MIT
