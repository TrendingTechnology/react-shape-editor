import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';
import { CallbacksContext } from './ShapeEditor';
import wrapShape from './wrapShape';
import withContext from './withContext';

const DefaultSelectionDrawComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(0,255,0,0.3)" height={height} width={width} />
));

const DefaultSelectionComponent = wrapShape(({ height, width, children }) => (
  <React.Fragment>
    <rect fill="rgba(255,0,0,0.3)" height={height} width={width} />
    {children}
  </React.Fragment>
));

const defaultDragState = {
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  isMouseDown: false,
};

export const SelectionContext = React.createContext(null);

class SelectionLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultDragState,
      selectedShapes: [],
    };

    this.wrappedShapes = [];

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.mouseHandler = this.mouseHandler.bind(this);
    this.onSelectionShapeMountedOrUnmounted = this.onSelectionShapeMountedOrUnmounted.bind(
      this
    );

    this.callbacks = {
      onShapeMountedOrUnmounted: this.onSelectionShapeMountedOrUnmounted,
      getPlaneCoordinatesFromEvent: props.getPlaneCoordinatesFromEvent,
      setMouseHandler: props.setMouseHandler,
    };
  }

  componentWillUnmount() {
    this.wrappedShapes = [];
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

    const selectRect = getRectFromCornerCoordinates(
      dragStartCoordinates,
      dragCurrentCoordinates
    );
    const selectedShapes = this.wrappedShapes.filter(shape => {
      const { x, y, width, height } = shape.props;
      return (
        x + width > selectRect.x &&
        x < selectRect.x + selectRect.width &&
        y + height > selectRect.y &&
        y < selectRect.y + selectRect.height
      );
    });

    this.setState({ ...defaultDragState, selectedShapes });
  }

  onMouseMove(event) {
    if (!this.state.isMouseDown) {
      return;
    }

    this.setState({
      dragCurrentCoordinates: this.props.getPlaneCoordinatesFromEvent(event),
    });
  }

  onSelectionShapeMountedOrUnmounted(instance, didMount) {
    // Call the original callback
    this.props.onShapeMountedOrUnmounted(instance, didMount);

    if (didMount) {
      this.wrappedShapes = [...this.wrappedShapes, instance];
    } else {
      this.wrappedShapes = this.wrappedShapes.filter(s => s !== instance);
    }

    // Clear the selection when shapes are being added or removed
    if (this.state.selectedShapes.length > 0) {
      this.setState({ selectedShapes: [] });
    }
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
      children,
      getPlaneCoordinatesFromEvent,
      scale,
      SelectionComponent,
      SelectionDrawComponent,
      setMouseHandler,
      vectorHeight,
      vectorWidth,
    } = this.props;
    const {
      dragCurrentCoordinates,
      dragStartCoordinates,
      isMouseDown,
      selectedShapes,
    } = this.state;

    const selectionX = Math.min(...selectedShapes.map(s => s.props.x));
    const selectionWidth =
      Math.max(...selectedShapes.map(s => s.props.x + s.props.width)) -
      selectionX;
    const selectionY = Math.min(...selectedShapes.map(s => s.props.y));
    const selectionHeight =
      Math.max(...selectedShapes.map(s => s.props.y + s.props.height)) -
      selectionY;

    const draggedRect = isMouseDown
      ? getRectFromCornerCoordinates(
          dragStartCoordinates,
          dragCurrentCoordinates
        )
      : null;

    let extra = null;
    if (isMouseDown) {
      extra = (
        <SelectionDrawComponent
          disabled
          height={draggedRect.height}
          isInternalComponent
          scale={scale}
          width={draggedRect.width}
          x={draggedRect.x}
          y={draggedRect.y}
        />
      );
    } else if (selectedShapes.length > 0) {
      extra = (
        <SelectionComponent
          height={selectionHeight}
          isInternalComponent
          scale={scale}
          width={selectionWidth}
          x={selectionX}
          y={selectionY}
        />
      );
    }

    return (
      <React.Fragment>
        <rect
          className="rse-selection-layer"
          width={vectorWidth}
          height={vectorHeight}
          fill="transparent"
          onMouseDown={event => {
            const startCoordinates = getPlaneCoordinatesFromEvent(event);
            setMouseHandler(this.mouseHandler);
            this.setState({
              dragStartCoordinates: startCoordinates,
              dragCurrentCoordinates: startCoordinates,
              isMouseDown: true,
              selectedShapes: [],
            });
          }}
        />
        <CallbacksContext.Provider value={this.callbacks}>
          <React.Fragment>
            {children}
            {extra}
          </React.Fragment>
        </CallbacksContext.Provider>
      </React.Fragment>
    );
  }
}

SelectionLayer.propTypes = {
  children: PropTypes.node,
  getPlaneCoordinatesFromEvent: PropTypes.func.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  onShapeMountedOrUnmounted: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  SelectionComponent: PropTypes.func,
  SelectionDrawComponent: PropTypes.func,
  setMouseHandler: PropTypes.func.isRequired,
  vectorHeight: PropTypes.number.isRequired,
  vectorWidth: PropTypes.number.isRequired,
};

SelectionLayer.defaultProps = {
  children: null,
  SelectionComponent: DefaultSelectionComponent,
  SelectionDrawComponent: DefaultSelectionDrawComponent,
};

export default withContext(SelectionLayer);
