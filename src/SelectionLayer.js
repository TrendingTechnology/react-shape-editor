import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';
import { CallbacksContext } from './ShapeEditor';
import wrapShape from './wrapShape';
import withContext from './withContext';

const DefaultSelectionDrawComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(140,179,255,0.3)" height={height} width={width} />
));

const DefaultSelectionComponent = wrapShape(({ height, width }) => (
  <rect
    fill="transparent"
    stroke="rgba(140,179,255,1)"
    strokeWidth={2}
    height={height}
    width={width}
  />
));

const defaultDragState = {
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  isMouseDown: false,
};

export const SelectionContext = React.createContext(null);

const SELECTION_COMPONENT_SHAPE_ID = 'rse-internal-selection-component';

class SelectionLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultDragState,
    };

    this.wrappedShapes = [];

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.mouseHandler = this.mouseHandler.bind(this);
    this.onChildFocus = this.onChildFocus.bind(this);
    this.onChildToggleSelection = this.onChildToggleSelection.bind(this);
    this.onSelectionShapeMountedOrUnmounted = this.onSelectionShapeMountedOrUnmounted.bind(
      this
    );

    this.callbacks = {
      ...props.callbacks,
      onChildFocus: this.onChildFocus,
      onChildToggleSelection: this.onChildToggleSelection,
      onShapeMountedOrUnmounted: this.onSelectionShapeMountedOrUnmounted,
    };
  }

  componentWillUnmount() {
    this.wrappedShapes = {};
  }

  onChildFocus(shapeId, isInternalComponent) {
    if (isInternalComponent) return;

    const { selectedShapeIds, onSelectionChange } = this.props;
    if (
      // We don't want to focus on the shape if it's already
      // the only focused shape
      selectedShapeIds.length !== 1 ||
      selectedShapeIds[0] !== shapeId
    ) {
      onSelectionChange([shapeId]);
    }
  }

  onChildToggleSelection(clickedShapeId, isInternalComponent, event) {
    const isClickingSelection = clickedShapeId === SELECTION_COMPONENT_SHAPE_ID;
    if (isInternalComponent && !isClickingSelection) return;

    let targetShapeId = clickedShapeId;

    // When trying to click shapes behind the selection rectangle, the
    // selection rectangle absorbs the mouseDown event, so we have to
    // use the position of the click to retrieve the element under the mouse.
    if (isClickingSelection) {
      const elementsUnderMouse = document.elementsFromPoint(
        event.clientX,
        event.clientY
      );

      // Only the child elements (e.g., <rect>) of the wrapShape <g> tags
      // get picked up by elementsFromPoint, so here we aim to access the
      // <g> tags (which contain the shapeId) by getting the parentNode
      // of each element found
      for (let i = 0; i < elementsUnderMouse.length; i += 1) {
        const el = elementsUnderMouse[i];
        if (
          !el.parentNode ||
          !el.parentNode.dataset ||
          !('shapeId' in el.parentNode.dataset) ||
          el.parentNode.dataset.shapeId === SELECTION_COMPONENT_SHAPE_ID
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        targetShapeId = el.parentNode.dataset.shapeId;
        break;
      }
    }

    const { selectedShapeIds, onSelectionChange } = this.props;
    const isAdd = selectedShapeIds.indexOf(targetShapeId) < 0;
    if (isAdd) {
      const nextSelectedShapeIds = [...selectedShapeIds, targetShapeId];
      onSelectionChange(nextSelectedShapeIds);

      if (nextSelectedShapeIds.length >= 2) {
        // Focus on the group selection rect when it is drawn
        if (this.selectionEl) {
          this.selectionEl.forceFocus();
        } else {
          setTimeout(() => {
            if (this.selectionEl) {
              this.selectionEl.forceFocus();
            }
          });
        }
      }
    } else if (selectedShapeIds.length >= 2) {
      // Only deselect when it is a group selection
      onSelectionChange(selectedShapeIds.filter(id => id !== targetShapeId));
    }
  }

  onMouseUp() {
    if (!this.state.isMouseDown) {
      return;
    }

    const { dragStartCoordinates, dragCurrentCoordinates } = this.state;
    const selectRect = getRectFromCornerCoordinates(
      dragStartCoordinates,
      dragCurrentCoordinates
    );
    const selectedShapeIds = Object.keys(this.wrappedShapes).filter(shapeId => {
      const { x, y, width, height } = this.wrappedShapes[shapeId].props;

      return (
        x + width > selectRect.x &&
        x < selectRect.x + selectRect.width &&
        y + height > selectRect.y &&
        y < selectRect.y + selectRect.height
      );
    });

    this.setState(defaultDragState);
    this.props.onSelectionChange(selectedShapeIds);
    if (selectedShapeIds.length >= 2 && this.selectionEl) {
      // Focus on the group selection rect when it is first drawn
      this.selectionEl.forceFocus();
    } else if (selectedShapeIds.length === 1) {
      // In the event that a single shape is selected, give native focus to it as well
      this.wrappedShapes[selectedShapeIds[0]].forceFocus();
    }
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
    const {
      onShapeMountedOrUnmounted,
      selectedShapeIds,
      onSelectionChange,
    } = this.props;

    // Call the original callback
    onShapeMountedOrUnmounted(instance, didMount);

    if (didMount) {
      this.wrappedShapes[instance.props.shapeId] = instance;
    } else {
      delete this.wrappedShapes[instance.props.shapeId];
    }

    // Clear the selection when shapes are being added or removed
    if (selectedShapeIds.length > 0) {
      onSelectionChange([]);
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
      onSelectionChange,
      onDelete,
      scale,
      selectedShapeIds,
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
    } = this.state;

    const draggedRect = isMouseDown
      ? getRectFromCornerCoordinates(
          dragStartCoordinates,
          dragCurrentCoordinates
        )
      : null;

    const selectedShapes = selectedShapeIds
      .map(shapeId => this.wrappedShapes[shapeId])
      .filter(Boolean);

    let extra = null;
    if (isMouseDown) {
      extra = (
        <SelectionDrawComponent
          shapeId="rse-internal-selection-draw-component"
          disabled
          height={draggedRect.height}
          isInternalComponent
          scale={scale}
          width={draggedRect.width}
          x={draggedRect.x}
          y={draggedRect.y}
        />
      );
    } else if (selectedShapes.length >= 2) {
      const selectionX = Math.min(...selectedShapes.map(s => s.props.x));
      const selectionWidth =
        Math.max(...selectedShapes.map(s => s.props.x + s.props.width)) -
        selectionX;
      const selectionY = Math.min(...selectedShapes.map(s => s.props.y));
      const selectionHeight =
        Math.max(...selectedShapes.map(s => s.props.y + s.props.height)) -
        selectionY;

      extra = (
        <SelectionComponent
          shapeId={SELECTION_COMPONENT_SHAPE_ID}
          height={selectionHeight}
          isInternalComponent
          ref={el => {
            this.selectionEl = el;
          }}
          onDelete={event => {
            onDelete(event, selectedShapes.map(shape => shape.props));
          }}
          onChange={(...args) => {}}
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
            });
            onSelectionChange([]);
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
  callbacks: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  getPlaneCoordinatesFromEvent: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onSelectionChange: PropTypes.func.isRequired,
  onShapeMountedOrUnmounted: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  selectedShapeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  SelectionComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({}),
  ]),
  SelectionDrawComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({}),
  ]),
  setMouseHandler: PropTypes.func.isRequired,
  vectorHeight: PropTypes.number.isRequired,
  vectorWidth: PropTypes.number.isRequired,
};

SelectionLayer.defaultProps = {
  children: null,
  onDelete: () => {},
  SelectionComponent: DefaultSelectionComponent,
  SelectionDrawComponent: DefaultSelectionDrawComponent,
};

export default withContext(SelectionLayer);
