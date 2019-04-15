import React, { Component } from 'react';
import PropTypes from 'prop-types';
import wrapShape from './wrapShape';
import DrawLayer from './DrawLayer';

const DefaultDrawComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(0,0,255,0.5)" height={height} width={width} />
));

class ShapeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      planeWidth: 0,
      planeHeight: 0,
    };
    this.childRefs = {};
    this.nextChildRefs = {};

    this.getImageDimensionInfo = this.getImageDimensionInfo.bind(this);
    this.onMouseEvent = this.onMouseEvent.bind(this);
    this.getPlaneCoordinatesFromEvent = this.getPlaneCoordinatesFromEvent.bind(
      this
    );
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseEvent);
    window.addEventListener('mousemove', this.onMouseEvent);
    this.getImageDimensionInfo();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.planeImageSrc !== this.props.planeImageSrc) {
      this.getImageDimensionInfo();
    }

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

  // Load the background image in memory to measure its dimensions
  getImageDimensionInfo() {
    if (!this.props.planeImageSrc) {
      return;
    }

    const memoryImage = new Image();

    memoryImage.onload = () => {
      if (!this.unmounted) {
        this.setState({
          planeWidth: memoryImage.naturalWidth,
          planeHeight: memoryImage.naturalHeight,
        });
      }
    };
    memoryImage.src = this.props.planeImageSrc;
  }

  render() {
    const {
      children,
      constrainMove,
      constrainResize,
      disableDrawMode,
      DrawPreviewComponent,
      planeImageSrc,
      scale,
      onAddShape,
    } = this.props;
    const { planeHeight, planeWidth } = this.state;

    const childConstrainMove = rect =>
      constrainMove({ ...rect, planeWidth, planeHeight });
    const childConstrainResize = args =>
      constrainResize({ ...args, planeWidth, planeHeight });

    if (!planeImageSrc) {
      return 'no image found';
    }

    const setMouseHandler = mouseHandler => {
      this.mouseHandler = mouseHandler;
    };
    return (
      <svg
        data-is-plane-container
        className="rse-plane-container"
        style={{
          backgroundImage: `url(${planeImageSrc})`,
          backgroundSize: 'cover',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        width={planeWidth * scale}
        height={planeHeight * scale}
        viewBox={`0 0 ${planeWidth} ${planeHeight}`}
        ref={el => {
          this.svgEl = el;
        }}
      >
        {!disableDrawMode && (
          <DrawLayer
            constrainMove={constrainMove}
            constrainResize={constrainResize}
            DrawPreviewComponent={DrawPreviewComponent}
            getPlaneCoordinatesFromEvent={this.getPlaneCoordinatesFromEvent}
            onAddShape={onAddShape}
            planeHeight={planeHeight}
            planeWidth={planeWidth}
            scale={scale}
            setMouseHandler={setMouseHandler}
          />
        )}
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, {
            constrainMove: childConstrainMove,
            constrainResize: childConstrainResize,
            getPlaneCoordinatesFromEvent: this.getPlaneCoordinatesFromEvent,
            ref: reactObj => {
              this.nextChildRefs[child.key] = reactObj;
            },
            scale,
            setMouseHandler: setMouseHandler,
          })
        )}
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
  planeImageSrc: PropTypes.string.isRequired,
  scale: PropTypes.number,
};

ShapeEditor.defaultProps = {
  children: null,
  constrainMove: ({ x, y }) => ({ x, y }),
  constrainResize: ({ movingCorner }) => movingCorner,
  onAddShape: () => {},
  disableDrawMode: false,
  DrawPreviewComponent: DefaultDrawComponent,
  scale: 1,
};

export default ShapeEditor;
