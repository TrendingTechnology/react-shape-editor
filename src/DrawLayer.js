import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';
import wrapShape from './wrapShape';

const DefaultDrawComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(0,0,255,0.5)" height={height} width={width} />
));

const defaultDragState = {
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  isMouseDown: false,
};

class DrawLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultDragState,
    };

    this.getCoordinatesFromEvent = this.getCoordinatesFromEvent.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.mouseHandler = this.mouseHandler.bind(this);
  }

  getCoordinatesFromEvent(event, isStartEvent = false) {
    const {
      constrainResize,
      constrainMove,
      getPlaneCoordinatesFromEvent,
      planeWidth,
      planeHeight,
    } = this.props;
    const { dragStartCoordinates, dragCurrentCoordinates } = this.state;
    const { x: rawX, y: rawY } = getPlaneCoordinatesFromEvent(event);

    if (isStartEvent) {
      const { x, y } = constrainMove({
        originalX: rawX,
        originalY: rawY,
        x: rawX,
        y: rawY,
        width: 0,
        height: 0,
        planeWidth,
        planeHeight,
      });

      return { x, y };
    }

    const { x, y } = constrainResize({
      originalMovingCorner: dragCurrentCoordinates,
      startCorner: dragStartCoordinates,
      movingCorner: { x: rawX, y: rawY },
      lockedDimension: null,
      planeWidth,
      planeHeight,
    });

    return { x, y };
  }

  onMouseUp() {
    if (!this.state.isMouseDown) {
      return;
    }

    const { dragStartCoordinates, dragCurrentCoordinates } = this.state;
    if (
      dragStartCoordinates.x === dragCurrentCoordinates.x ||
      dragStartCoordinates.y === dragCurrentCoordinates.y
    ) {
      this.setState(defaultDragState);
      return;
    }

    const newRect = getRectFromCornerCoordinates(
      dragStartCoordinates,
      dragCurrentCoordinates
    );

    this.setState(defaultDragState, () => {
      this.props.onAddShape(newRect);
    });
  }

  onMouseMove(event) {
    if (!this.state.isMouseDown) {
      return;
    }

    this.setState({
      dragCurrentCoordinates: this.getCoordinatesFromEvent(event),
    });
  }

  mouseHandler(event) {
    if (event.type === 'mousemove') {
      this.onMouseMove(event);
    } else if (event.type === 'mouseup') {
      this.onMouseUp(event);
    }
  }

  render() {
    const {
      DrawPreviewComponent,
      planeHeight,
      planeWidth,
      scale,
      setMouseHandler,
    } = this.props;
    const {
      dragCurrentCoordinates,
      dragStartCoordinates,
      isMouseDown,
    } = this.state;

    const draggedRect = isMouseDown
      ? getRectFromCornerCoordinates(
          dragStartCoordinates,
          dragCurrentCoordinates
        )
      : null;

    return (
      <React.Fragment>
        <rect
          className="rse-draw-layer"
          width={planeWidth}
          height={planeHeight}
          fill="transparent"
          onMouseDown={event => {
            const startCoordinates = this.getCoordinatesFromEvent(event, true);
            setMouseHandler(this.mouseHandler);
            this.setState({
              dragStartCoordinates: startCoordinates,
              dragCurrentCoordinates: startCoordinates,
              isMouseDown: true,
            });
          }}
        />
        {isMouseDown && (
          <DrawPreviewComponent
            height={draggedRect.height}
            disabled
            scale={scale}
            width={draggedRect.width}
            x={draggedRect.x}
            y={draggedRect.y}
          />
        )}
      </React.Fragment>
    );
  }
}

DrawLayer.propTypes = {
  constrainMove: PropTypes.func.isRequired,
  constrainResize: PropTypes.func.isRequired,
  DrawPreviewComponent: PropTypes.func,
  getPlaneCoordinatesFromEvent: PropTypes.func.isRequired,
  onAddShape: PropTypes.func.isRequired,
  planeHeight: PropTypes.number.isRequired,
  planeWidth: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  setMouseHandler: PropTypes.func.isRequired,
};

DrawLayer.defaultProps = {
  DrawPreviewComponent: DefaultDrawComponent,
};

DrawLayer.rseType = 'DrawLayer';

export default DrawLayer;
