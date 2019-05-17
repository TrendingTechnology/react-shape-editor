import React, { Component } from 'react';
import PropTypes from 'prop-types';

export const CallbacksContext = React.createContext({
  getPlaneCoordinatesFromEvent: () => {},
  onShapeMountedOrUnmounted: () => {},
  setMouseHandler: () => {},
});
export const VectorHeightContext = React.createContext(0);
export const VectorWidthContext = React.createContext(0);
export const ScaleContext = React.createContext(1);

class ShapeEditor extends Component {
  constructor(props) {
    super(props);

    this.wrappedShapes = [];
    this.justAddedShapes = [];

    this.getPlaneCoordinatesFromEvent = this.getPlaneCoordinatesFromEvent.bind(
      this
    );
    this.onMouseEvent = this.onMouseEvent.bind(this);
    this.onShapeMountedOrUnmounted = this.onShapeMountedOrUnmounted.bind(this);
    this.setMouseHandler = this.setMouseHandler.bind(this);

    this.callbacks = {
      onShapeMountedOrUnmounted: this.onShapeMountedOrUnmounted,
      getPlaneCoordinatesFromEvent: this.getPlaneCoordinatesFromEvent,
      setMouseHandler: this.setMouseHandler,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseEvent);
    window.addEventListener('mousemove', this.onMouseEvent);
  }

  componentDidUpdate() {
    if (this.justAddedShapes.length > 0 && this.props.focusOnAdd) {
      // Focus on shapes added since the last update
      this.justAddedShapes.slice(-1)[0].forceFocus();
    } else if (this.lastDeletedRect && this.props.focusOnDelete) {
      // If something was deleted since the last update, focus on the
      // next closest shape by center coordinates
      const getShapeCenter = shape => ({
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
      });
      const deletedShapeCenter = getShapeCenter(this.lastDeletedRect);

      let closestDistance = Math.MAX_SAFE_INTEGER || 2 ** 53 - 1;
      let closestShape = null;
      this.wrappedShapes.forEach(shape => {
        const shapeCenter = getShapeCenter(shape.props);
        const distance =
          (deletedShapeCenter.x - shapeCenter.x) ** 2 +
          (deletedShapeCenter.y - shapeCenter.y) ** 2;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestShape = shape;
        }
      });

      if (closestShape) {
        closestShape.forceFocus();
      }
    }

    this.justAddedShapes = [];
    this.lastDeletedRect = null;
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseEvent);
    window.removeEventListener('mousemove', this.onMouseEvent);

    this.justAddedShapes = [];
    this.wrappedShapes = [];
    this.unmounted = true;
  }

  onMouseEvent(event) {
    if (typeof this.mouseHandler === 'function') {
      this.mouseHandler(event);
    }
  }

  onShapeMountedOrUnmounted(instance, didMount) {
    if (didMount) {
      this.justAddedShapes = [...this.justAddedShapes, instance];
      this.wrappedShapes = [...this.wrappedShapes, instance];
    } else {
      this.lastDeletedRect = {
        x: instance.props.x,
        y: instance.props.y,
        width: instance.props.width,
        height: instance.props.height,
      };
      this.wrappedShapes = this.wrappedShapes.filter(s => s !== instance);
    }
  }

  setMouseHandler(mouseHandler) {
    this.mouseHandler = mouseHandler;
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
      scale,
      vectorHeight,
      vectorWidth,
      style,
      ...otherProps
    } = this.props;

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
          ...style,
        }}
        // IE11 - prevent all elements from being focusable by default
        focusable={false}
        {...otherProps}
      >
        <CallbacksContext.Provider value={this.callbacks}>
          <VectorHeightContext.Provider value={vectorHeight}>
            <VectorWidthContext.Provider value={vectorWidth}>
              <ScaleContext.Provider value={scale}>
                {children}
              </ScaleContext.Provider>
            </VectorWidthContext.Provider>
          </VectorHeightContext.Provider>
        </CallbacksContext.Provider>
      </svg>
    );
  }
}

ShapeEditor.propTypes = {
  children: PropTypes.node,
  focusOnAdd: PropTypes.bool,
  focusOnDelete: PropTypes.bool,
  scale: PropTypes.number,
  style: PropTypes.shape({}),
  vectorHeight: PropTypes.number,
  vectorWidth: PropTypes.number,
};

ShapeEditor.defaultProps = {
  children: null,
  focusOnAdd: true,
  focusOnDelete: true,
  scale: 1,
  style: {},
  vectorHeight: 0,
  vectorWidth: 0,
};

export default ShapeEditor;
