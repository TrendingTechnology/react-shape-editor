import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';

const defaultDragState = {
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
};

class ShapeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultDragState,
    };

    this.getCoordinatesFromEvent = this.getCoordinatesFromEvent.bind(this);
    this.onDragFinish = this.onDragFinish.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onDragFinish);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onDragFinish);
    this.unmounted = true;
  }

  getCoordinatesFromEvent(event, isStartEvent = false) {
    const {
      scale,
      constrainResize,
      constrainMove,
      planeWidth,
      planeHeight,
    } = this.props;
    const { dragStartCoordinates } = this.state;

    const { top, left } = event.target.getBoundingClientRect();
    const rawX = (event.clientX - left) / scale;
    const rawY = (event.clientY - top) / scale;

    if (isStartEvent) {
      const { x, y } = constrainMove({
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
      startCorner: dragStartCoordinates,
      movingCorner: { x: rawX, y: rawY },
      lockedDimension: null,
      planeWidth,
      planeHeight,
    });

    return { x, y };
  }

  onDragFinish(event) {
    if (!this.props.isDrawing) {
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

    this.props.setIsDrawing(false);
    this.setState(defaultDragState, () => {
      this.props.onAddShape(newRect);
    });
  }

  render() {
    const {
      DrawPreviewComponent,
      planeHeight,
      planeWidth,
      scale,
      isDrawing,
      setIsDrawing,
    } = this.props;
    const { dragCurrentCoordinates, dragStartCoordinates } = this.state;

    const draggedRect = isDrawing
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

            this.setState({
              dragStartCoordinates: startCoordinates,
              dragCurrentCoordinates: startCoordinates,
            });
            setIsDrawing(true);
          }}
          onMouseMove={event => {
            if (!isDrawing) {
              return;
            }

            this.setState({
              dragCurrentCoordinates: this.getCoordinatesFromEvent(event),
            });
          }}
        />
        {isDrawing && (
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

ShapeEditor.propTypes = {
  constrainMove: PropTypes.func.isRequired,
  constrainResize: PropTypes.func.isRequired,
  DrawPreviewComponent: PropTypes.func.isRequired,
  isDrawing: PropTypes.bool.isRequired,
  onAddShape: PropTypes.func.isRequired,
  planeHeight: PropTypes.number.isRequired,
  planeWidth: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  setIsDrawing: PropTypes.func.isRequired,
};

export default ShapeEditor;
