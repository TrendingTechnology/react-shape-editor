import React from 'react';
import PropTypes from 'prop-types';
import DefaultResizeHandleComponent from './DefaultResizeHandleComponent';
import withContext from './withContext';
import {
  getRectFromCornerCoordinates,
  defaultConstrainMove,
  defaultConstrainResize,
} from './utils';

const defaultDragState = {
  isMouseDown: false,
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  dragInnerOffset: null,
  dragLock: null,
};

function wrapShape(WrappedComponent) {
  const WrappedShape = class extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        ...defaultDragState,
        isDragToMove: true,
        active: false,
      };

      this.onMouseUp = this.onMouseUp.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.getParentCoordinatesForMove = this.getParentCoordinatesForMove.bind(
        this
      );
      this.getParentCoordinatesForResize = this.getParentCoordinatesForResize.bind(
        this
      );
      this.forceFocus = this.forceFocus.bind(this);
      this.keyboardMove = this.keyboardMove.bind(this);
      this.keyboardResize = this.keyboardResize.bind(this);
      this.mouseHandler = this.mouseHandler.bind(this);
    }

    componentDidMount() {
      if (!this.props.isInternalComponent) {
        this.props.onShapeMountedOrUnmounted(this, true);
      }
    }

    componentWillUnmount() {
      this.unmounted = true;

      if (!this.props.isInternalComponent) {
        this.props.onShapeMountedOrUnmounted(this, false);
      }
    }

    onMouseMove(event) {
      if (!this.state.isMouseDown || this.unmounted) {
        return;
      }

      if (this.state.isDragToMove) {
        const coords = this.getParentCoordinatesForMove(event);
        if (coords) {
          this.setState({
            dragCurrentCoordinates: coords,
            dragStartCoordinates: {
              x: coords.x + this.props.width,
              y: coords.y + this.props.height,
            },
          });
        }
      } else {
        const coords = this.getParentCoordinatesForResize(event);
        if (coords) {
          this.setState({
            dragCurrentCoordinates: coords,
          });
        }
      }
    }

    onMouseUp() {
      if (!this.state.isMouseDown || this.unmounted) {
        return;
      }

      const { onChange } = this.props;
      const {
        dragStartCoordinates,
        dragCurrentCoordinates,
        isDragToMove,
      } = this.state;

      if (isDragToMove) {
        const { x: nextX, y: nextY } = dragCurrentCoordinates;

        this.setState(defaultDragState, () => {
          onChange(
            {
              x: nextX,
              y: nextY,
              width: this.props.width,
              height: this.props.height,
            },
            this.props
          );
        });
      } else {
        this.setState(defaultDragState, () => {
          onChange(
            getRectFromCornerCoordinates(
              dragStartCoordinates,
              dragCurrentCoordinates
            ),
            this.props
          );
        });
      }
    }

    mouseHandler(event) {
      if (event.type === 'mousemove') {
        this.onMouseMove(event);
      } else if (event.type === 'mouseup') {
        this.onMouseUp(event);
      }
    }

    getParentCoordinatesForMove(event) {
      const {
        constrainMove,
        width,
        height,
        getPlaneCoordinatesFromEvent,
      } = this.props;
      const { dragCurrentCoordinates, dragInnerOffset } = this.state;

      const { x: rawX, y: rawY } = getPlaneCoordinatesFromEvent(
        event,
        dragInnerOffset
      );

      const { x, y } = constrainMove({
        originalX: dragCurrentCoordinates ? dragCurrentCoordinates.x : rawX,
        originalY: dragCurrentCoordinates ? dragCurrentCoordinates.y : rawY,
        x: rawX,
        y: rawY,
        width,
        height,
      });

      return { x, y };
    }

    getParentCoordinatesForResize(
      event,
      dragStartCoordinates = this.state.dragStartCoordinates,
      dragCurrentCoordinates = this.state.dragCurrentCoordinates,
      dragInnerOffset = this.state.dragInnerOffset,
      dragLock = this.state.dragLock
    ) {
      const {
        constrainResize,
        width,
        height,
        getPlaneCoordinatesFromEvent,
      } = this.props;
      const { x: rawX, y: rawY } = getPlaneCoordinatesFromEvent(
        event,
        dragInnerOffset
      );

      const { x, y } = constrainResize({
        originalMovingCorner: dragCurrentCoordinates,
        startCorner: dragStartCoordinates,
        movingCorner: { x: rawX, y: rawY },
        width,
        height,
        lockedDimension: dragLock,
      });

      return {
        x: dragLock !== 'x' ? x : dragCurrentCoordinates.x,
        y: dragLock !== 'y' ? y : dragCurrentCoordinates.y,
      };
    }

    keyboardMove(dX, dY) {
      const {
        x,
        y,
        width,
        height,
        keyboardTransformMultiplier,
        constrainMove,
        onChange,
      } = this.props;

      const { x: nextX, y: nextY } = constrainMove({
        originalX: x,
        originalY: y,
        x: x + dX * keyboardTransformMultiplier,
        y: y + dY * keyboardTransformMultiplier,
        width,
        height,
      });

      onChange(
        {
          x: nextX,
          y: nextY,
          width: this.props.width,
          height: this.props.height,
        },
        this.props
      );
    }

    keyboardResize(dX, dY) {
      const {
        x,
        y,
        width,
        height,
        keyboardTransformMultiplier,
        constrainResize,
        onChange,
      } = this.props;

      const { x: nextX, y: nextY } = constrainResize({
        originalMovingCorner: {
          x: x + width,
          y: y + height,
        },
        startCorner: { x, y },
        movingCorner: {
          x: x + width + dX * keyboardTransformMultiplier,
          y: y + height + dY * keyboardTransformMultiplier,
        },
      });

      onChange(
        getRectFromCornerCoordinates({ x, y }, { x: nextX, y: nextY }),
        this.props
      );
    }

    forceFocus() {
      // IE11 doesn't have the focus method
      if (this.wrapperEl.focus) {
        this.wrapperEl.focus();
      }
    }

    render() {
      const {
        // props extracted here are not passed to child
        constrainMove,
        constrainResize,
        getPlaneCoordinatesFromEvent,
        onBlur,
        onChange,
        onDelete,
        onFocus,
        onKeyDown,
        ResizeHandleComponent,
        setMouseHandler,
        wrapperProps,
        ...otherProps
      } = this.props;
      const {
        // props extracted here are still passed to the child
        scale,
        disabled,
      } = this.props;
      const {
        active,
        isMouseDown,
        dragStartCoordinates,
        dragCurrentCoordinates,
      } = this.state;

      const sides = !isMouseDown
        ? {
            left: this.props.x,
            right: this.props.x + this.props.width,
            top: this.props.y,
            bottom: this.props.y + this.props.height,
          }
        : {
            left: Math.min(dragStartCoordinates.x, dragCurrentCoordinates.x),
            right: Math.max(dragStartCoordinates.x, dragCurrentCoordinates.x),
            top: Math.min(dragStartCoordinates.y, dragCurrentCoordinates.y),
            bottom: Math.max(dragStartCoordinates.y, dragCurrentCoordinates.y),
          };
      const width = sides.right - sides.left;
      const height = sides.bottom - sides.top;

      // The corner of the resize box that moves
      const movementPoints = {
        nw: { x: sides.left, y: sides.top },
        sw: { x: sides.left, y: sides.bottom },
        ne: { x: sides.right, y: sides.top },
        se: { x: sides.right, y: sides.bottom },
      };
      // The corner of the resize box that stays static
      const anchorPoints = {
        nw: movementPoints.se,
        sw: movementPoints.ne,
        ne: movementPoints.sw,
        se: movementPoints.nw,
      };

      const RECOMMENDED_CORNER_SIZE = 10;
      const cornerSize = RECOMMENDED_CORNER_SIZE / scale;
      const hasSpaciousVertical =
        (sides.bottom - sides.top) * scale > cornerSize * 2;
      const hasSpaciousHorizontal =
        (sides.right - sides.left) * scale > cornerSize * 2;
      // Generate drag handles
      const handles = [
        hasSpaciousVertical && ['w', 'nw', 'ew-resize', 0, height / 2, 'y'],
        hasSpaciousHorizontal && ['n', 'ne', 'ns-resize', width / 2, 0, 'x'],
        hasSpaciousHorizontal && [
          's',
          'sw',
          'ns-resize',
          width / 2,
          height,
          'x',
        ],
        hasSpaciousVertical && ['e', 'se', 'ew-resize', width, height / 2, 'y'],
        ['nw', 'nw', 'nwse-resize', 0, 0, null],
        ['ne', 'ne', 'nesw-resize', width, 0, null],
        ['sw', 'sw', 'nesw-resize', 0, height, null],
        ['se', 'se', 'nwse-resize', width, height, null],
      ]
        .filter(a => a)
        .map(
          ([handleName, movementReferenceCorner, cursor, x, y, dragLock]) => (
            <ResizeHandleComponent
              key={handleName}
              active={active}
              cursor={cursor}
              onMouseDown={event => {
                event.stopPropagation();

                const { x: planeX, y: planeY } = getPlaneCoordinatesFromEvent(
                  event
                );

                const movingPoint = movementPoints[movementReferenceCorner];
                const anchorPoint = anchorPoints[movementReferenceCorner];
                const dragInnerOffset = {
                  x: planeX - movingPoint.x,
                  y: planeY - movingPoint.y,
                };

                setMouseHandler(this.mouseHandler);
                this.setState({
                  isMouseDown: true,
                  dragStartCoordinates: anchorPoint,
                  dragCurrentCoordinates: movingPoint,
                  dragInnerOffset,
                  isDragToMove: false,
                  dragLock,
                });
              }}
              recommendedSize={cornerSize}
              scale={scale}
              x={x}
              y={y}
            />
          )
        );

      return (
        <g
          className="rse-shape-wrapper"
          transform={`translate(${sides.left},${sides.top})`}
          style={{
            cursor: 'move',
            outline: 'none',
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          ref={el => {
            this.wrapperEl = el;
          }}
          focusable={!disabled ? true : undefined} // IE11 support
          tabIndex={!disabled ? 0 : undefined}
          onFocus={event => {
            this.setState({ active: true });
            onFocus(event, this.props);
          }}
          onBlur={event => {
            this.setState({ active: false });
            onBlur(event, this.props);
          }}
          onMouseDown={event => {
            event.stopPropagation();
            const { x, y } = this.props;
            const { x: planeX, y: planeY } = getPlaneCoordinatesFromEvent(
              event
            );
            const dragInnerOffset = {
              x: planeX - x,
              y: planeY - y,
            };

            setMouseHandler(this.mouseHandler);
            this.setState({
              isMouseDown: true,
              dragCurrentCoordinates: { x, y },
              dragStartCoordinates: {
                x: x + width,
                y: y + height,
              },
              dragInnerOffset,
              isDragToMove: true,
            });
          }}
          onKeyDown={event => {
            onKeyDown(event, this.props);

            // If the user-defined callback called event.preventDefault(),
            // we consider the event handled
            if (event.defaultPrevented) {
              return;
            }

            let handled = true;
            const handleKeyboardTransform = (moveArgs, resizeArgs) =>
              event.shiftKey
                ? this.keyboardResize(...resizeArgs)
                : this.keyboardMove(...moveArgs);
            switch (event.key) {
              case 'Backspace':
                onDelete(event, this.props);
                break;
              case 'ArrowUp':
                handleKeyboardTransform([0, -1], [0, -1]);
                break;
              case 'ArrowRight':
                handleKeyboardTransform([1, 0], [1, 0]);
                break;
              case 'ArrowDown':
                handleKeyboardTransform([0, 1], [0, 1]);
                break;
              case 'ArrowLeft':
                handleKeyboardTransform([-1, 0], [-1, 0]);
                break;
              default:
                handled = false;
            }

            if (handled) {
              event.preventDefault();
            }
          }}
          {...wrapperProps}
        >
          <WrappedComponent
            isBeingChanged={isMouseDown}
            active={active}
            {...otherProps}
            width={width}
            height={height}
          />
          {!disabled && handles}
        </g>
      );
    }
  };

  WrappedShape.propTypes = {
    constrainMove: PropTypes.func,
    constrainResize: PropTypes.func,
    disabled: PropTypes.bool,
    getPlaneCoordinatesFromEvent: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    isInternalComponent: PropTypes.bool,
    keyboardTransformMultiplier: PropTypes.number,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyDown: PropTypes.func,
    onShapeMountedOrUnmounted: PropTypes.func.isRequired,
    ResizeHandleComponent: PropTypes.func,
    scale: PropTypes.number.isRequired,
    setMouseHandler: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    wrapperProps: PropTypes.shape({}),
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  WrappedShape.defaultProps = {
    constrainMove: defaultConstrainMove,
    constrainResize: defaultConstrainResize,
    disabled: false,
    isInternalComponent: false,
    keyboardTransformMultiplier: 1,
    onBlur: () => {},
    onChange: () => {},
    onDelete: () => {},
    onFocus: () => {},
    onKeyDown: () => {},
    ResizeHandleComponent: DefaultResizeHandleComponent,
    wrapperProps: {},
  };

  return withContext(WrappedShape);
}

export default wrapShape;
