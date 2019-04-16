import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DrawLayer from './DrawLayer';

class ShapeEditor extends Component {
  constructor(props) {
    super(props);

    this.childRefs = {};
    this.nextChildRefs = {};

    this.onMouseEvent = this.onMouseEvent.bind(this);
    this.getPlaneCoordinatesFromEvent = this.getPlaneCoordinatesFromEvent.bind(
      this
    );
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseEvent);
    window.addEventListener('mousemove', this.onMouseEvent);
  }

  componentDidUpdate() {
    // Focus on newly added children
    const newChildrenKeys = Object.keys(this.nextChildRefs).filter(
      key => !this.childRefs[key]
    );
    if (newChildrenKeys.length > 0) {
      this.nextChildRefs[newChildrenKeys[0]].forceFocus();
    }
    this.childRefs = this.nextChildRefs;
    this.nextChildRefs = {};
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseEvent);
    window.removeEventListener('mousemove', this.onMouseEvent);
    this.unmounted = true;
  }

  onMouseEvent(event) {
    if (typeof this.mouseHandler === 'function') {
      this.mouseHandler(event);
    }
  }

  getPlaneCoordinatesFromEvent(event, { x: offsetX = 0, y: offsetY = 0 } = {}) {
    const { scale } = this.props;
    const { top, left } = this.svgEl.getBoundingClientRect();

    return {
      x: (event.clientX - left) / scale - offsetX,
      y: (event.clientY - top) / scale - offsetY,
    };
  }

  render() {
    const {
      children,
      constrainMove,
      constrainResize,
      disableDrawMode,
      DrawPreviewComponent,
      onAddShape,
      scale,
      vectorHeight,
      vectorWidth,
    } = this.props;

    const setMouseHandler = mouseHandler => {
      this.mouseHandler = mouseHandler;
    };
    return (
      <svg
        className="rse-plane-container"
        width={vectorWidth * scale}
        height={vectorHeight * scale}
        viewBox={`0 0 ${vectorWidth} ${vectorHeight}`}
        ref={el => {
          this.svgEl = el;
        }}
        style={{
          userSelect: 'none',
        }}
        // IE11 - prevent all elements from being focusable by default
        focusable={false}
      >
        {!disableDrawMode && (
          <DrawLayer
            constrainMove={constrainMove}
            constrainResize={constrainResize}
            DrawPreviewComponent={DrawPreviewComponent}
            getPlaneCoordinatesFromEvent={this.getPlaneCoordinatesFromEvent}
            onAddShape={onAddShape}
            planeHeight={vectorHeight}
            planeWidth={vectorWidth}
            scale={scale}
            setMouseHandler={setMouseHandler}
          />
        )}
        {React.Children.map(children, child => {
          switch (child.type.rseType) {
            case 'WrappedShape':
              return React.cloneElement(child, {
                constrainMove,
                constrainResize,
                getPlaneCoordinatesFromEvent: this.getPlaneCoordinatesFromEvent,
                ref: reactObj => {
                  this.nextChildRefs[child.key] = reactObj;
                },
                scale,
                setMouseHandler,
              });
            default:
              return child;
          }
        })}
      </svg>
    );
  }
}

ShapeEditor.propTypes = {
  children: PropTypes.node,
  constrainMove: PropTypes.func,
  constrainResize: PropTypes.func,
  disableDrawMode: PropTypes.bool,
  DrawPreviewComponent: PropTypes.func,
  onAddShape: PropTypes.func,
  scale: PropTypes.number,
  vectorHeight: PropTypes.number,
  vectorWidth: PropTypes.number,
};

ShapeEditor.defaultProps = {
  children: null,
  constrainMove: ({ x, y }) => ({ x, y }),
  constrainResize: ({ movingCorner }) => movingCorner,
  disableDrawMode: false,
  DrawPreviewComponent: undefined,
  onAddShape: () => {},
  scale: 1,
  vectorHeight: 0,
  vectorWidth: 0,
};

export default ShapeEditor;
