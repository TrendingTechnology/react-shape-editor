import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    const { children, scale, vectorHeight, vectorWidth } = this.props;

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
        {React.Children.map(children, child => {
          switch (child.type.rseType) {
            case 'DrawLayer':
              return React.cloneElement(child, {
                getPlaneCoordinatesFromEvent: this.getPlaneCoordinatesFromEvent,
                vectorHeight,
                vectorWidth,
                scale,
                setMouseHandler,
              });
            case 'WrappedShape':
              return React.cloneElement(child, {
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
  scale: PropTypes.number,
  vectorHeight: PropTypes.number,
  vectorWidth: PropTypes.number,
};

ShapeEditor.defaultProps = {
  children: null,
  scale: 1,
  vectorHeight: 0,
  vectorWidth: 0,
};

export default ShapeEditor;
