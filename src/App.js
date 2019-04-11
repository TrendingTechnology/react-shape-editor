import React, { Component } from 'react';
import RectEditor from './RectEditor';
import SingleLineChild from './SingleLineChild';
import formImage from './blank.jpg';

let iterator = 0;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scale: 1,
      items: [{ id: 1, x: 92, y: 200, width: 50, height: 25 }],
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

    return (
      <div style={{ height: 400, paddingLeft: 20 }}>
        <button onClick={() => changeScale(1 / Math.sqrt(2))}>-</button>
        <button onClick={() => changeScale(Math.sqrt(2))}>+</button>
        <br />
        <RectEditor
          backgroundSrc={formImage}
          scale={scale}
          onAddChild={({ x, y, width, height }) => {
            this.setState(state => ({
              items: [
                ...state.items,
                { id: `id${iterator}`, x, y, width, height },
              ],
            }));
            iterator += 1;
          }}
        >
          {items.map(({ id, width, height, x, y, type, ...otherProps }) => (
            <SingleLineChild
              key={id}
              width={width}
              height={height}
              x={x}
              y={y}
              onDimensionChange={args => {
                console.log('((((dimensionChangeArgs))))', args); // eslint-disable-line no-console
              }}
              {...otherProps}
            />
          ))}
        </RectEditor>
      </div>
    );
  }
}

export default App;
