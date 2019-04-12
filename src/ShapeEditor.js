import React, { Component } from 'react';
import PropTypes from 'prop-types';
import wrapShape from './wrapShape';
import { getRectFromCornerCoordinates } from './utils';

const DefaultDrawComponent = wrapShape(() => (
  <div style={{ background: 'rgba(0,0,255,0.5)', height: '100%' }} />
));

const defaultDragState = {
  hasDragStarted: false,
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
};

class ShapeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultDragState,
      planeWidth: 0,
      planeHeight: 0,
    };
    this.childRefs = {};
    this.nextChildRefs = {};

    this.getImageDimensionInfo = this.getImageDimensionInfo.bind(this);
    this.getScaledDimensions = this.getScaledDimensions.bind(this);
    this.getCoordinatesFromEvent = this.getCoordinatesFromEvent.bind(this);
    this.onDragFinish = this.onDragFinish.bind(this);
  }

  componentDidMount() {
    this.getImageDimensionInfo();

    window.addEventListener('mouseup', this.onDragFinish);
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
    this.childRefs = { ...this.nextChildRefs };
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onDragFinish);
    this.unmounted = true;
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

  getScaledDimensions() {
    const { scale } = this.props;
    const { planeHeight, planeWidth } = this.state;

    return {
      scaledWidth: planeWidth * scale,
      scaledHeight: planeHeight * scale,
    };
  }

  getCoordinatesFromEvent(event, isStartEvent = false) {
    const { scale, constrainResize, constrainMove } = this.props;
    const { dragStartCoordinates, planeWidth, planeHeight } = this.state;

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
    if (!this.state.hasDragStarted) {
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

  render() {
    const {
      children,
      constrainMove,
      constrainResize,
      disableDrawMode,
      DrawPreviewComponent,
      planeImageSrc,
      scale,
    } = this.props;
    const {
      dragCurrentCoordinates,
      dragStartCoordinates,
      hasDragStarted,
      planeHeight,
      planeWidth,
    } = this.state;
    const { scaledWidth, scaledHeight } = this.getScaledDimensions();

    const draggedRect = hasDragStarted
      ? getRectFromCornerCoordinates(
          dragStartCoordinates,
          dragCurrentCoordinates
        )
      : null;

    const childConstrainMove = rect =>
      constrainMove({ ...rect, planeWidth, planeHeight });
    const childConstrainResize = args =>
      constrainResize({ ...args, planeWidth, planeHeight });

    return (
      <div
        className="rse-outer-container"
        style={{ overflow: 'auto', height: '100%', userSelect: 'none' }}
      >
        {planeImageSrc ? (
          <div
            data-is-plane-container
            className="rse-plane-container"
            style={{
              backgroundImage: `url(${planeImageSrc})`,
              backgroundSize: 'cover',
              height: scaledHeight,
              width: scaledWidth,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseDown={event => {
              if (disableDrawMode) {
                return;
              }

              const startCoordinates = this.getCoordinatesFromEvent(
                event,
                true
              );
              this.setState({
                hasDragStarted: true,
                dragStartCoordinates: startCoordinates,
                dragCurrentCoordinates: startCoordinates,
              });
            }}
            onMouseMove={event => {
              if (!hasDragStarted) {
                return;
              }

              const currentCoordinates = this.getCoordinatesFromEvent(event);

              this.setState({
                dragCurrentCoordinates: currentCoordinates,
              });
            }}
          >
            {React.Children.map(children, (child, i) =>
              React.cloneElement(child, {
                constrainMove: childConstrainMove,
                constrainResize: childConstrainResize,
                scale,
                isPlaneDragging: hasDragStarted,
                ref: reactObj => {
                  this.nextChildRefs[child.key] = reactObj;
                },
              })
            )}

            {hasDragStarted && (
              <DrawPreviewComponent
                height={draggedRect.height}
                disabled
                scale={scale}
                width={draggedRect.width}
                x={draggedRect.x}
                y={draggedRect.y}
              />
            )}
          </div>
        ) : (
          'no image found'
        )}
      </div>
    );
  }
}

ShapeEditor.propTypes = {
  children: PropTypes.node,
  constrainMove: PropTypes.func,
  constrainResize: PropTypes.func,
  disableDrawMode: PropTypes.bool,
  DrawPreviewComponent: PropTypes.func,
  onAddShape: PropTypes.func.isRequired,
  planeImageSrc: PropTypes.string.isRequired,
  scale: PropTypes.number,
};

ShapeEditor.defaultProps = {
  children: null,
  constrainMove: ({ x, y }) => ({ x, y }),
  constrainResize: ({ movingCorner }) => movingCorner,
  disableDrawMode: false,
  DrawPreviewComponent: DefaultDrawComponent,
  scale: 1,
};

export default ShapeEditor;
