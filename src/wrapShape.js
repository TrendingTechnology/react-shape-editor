import React from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';

const defaultDragState = {
  isMouseDown: false,
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  dragInnerOffset: null,
  dragLock: null,
};

function wrapShape(WrappedComponent) {
  const ItemHOC = class extends React.Component {
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

    componentWillUnmount() {
      this.unmounted = true;
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
        return;
      }
      if (event.type === 'mouseup') {
        this.onMouseUp(event);
        return;
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
      this.wrapperEl.focus();
    }

    render() {
      const {
        // props extracted here are not passed to child
        constrainMove,
        constrainResize,
        getPlaneCoordinatesFromEvent,
        onChange,
        onDelete,
        onKeyDown,
        setMouseHandler,
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

      const SPACIOUS_PIXELS = 20;
      const cornerSize = SPACIOUS_PIXELS / 2 / scale;
      const hasSpaciousVertical =
        (sides.bottom - sides.top) * scale > SPACIOUS_PIXELS;
      const hasSpaciousHorizontal =
        (sides.right - sides.left) * scale > SPACIOUS_PIXELS;
      // Generate drag handles
      const handles = [
        hasSpaciousHorizontal && ['n', 'ne', 'ns-resize', width / 2, 0, 'x'],
        ['ne', 'ne', 'nesw-resize', width, 0, null],
        hasSpaciousVertical && ['e', 'se', 'ew-resize', width, height / 2, 'y'],
        ['se', 'se', 'nwse-resize', width, height, null],
        hasSpaciousHorizontal && [
          's',
          'sw',
          'ns-resize',
          width / 2,
          height,
          'x',
        ],
        ['sw', 'sw', 'nesw-resize', 0, height, null],
        hasSpaciousVertical && ['w', 'nw', 'ew-resize', 0, height / 2, 'y'],
        ['nw', 'nw', 'nwse-resize', 0, 0, null],
      ]
        .filter(a => a)
        .map(
          (
            [handleName, movementReferenceCorner, cursor, left, top, dragLock],
            index
          ) => (
            <rect
              key={handleName}
              x={left - cornerSize / 2}
              y={top - cornerSize / 2}
              width={cornerSize}
              height={cornerSize}
              strokeWidth={1 / scale}
              style={{
                ...(active
                  ? { fill: 'rgba(255,0,0,0.8)', stroke: 'rgba(255,0,0,0.8)' }
                  : {
                      fill: 'rgba(255,0,0,0.2)',
                      stroke: 'rgba(255,0,0,0.3)',
                    }),
                cursor,
              }}
              onMouseDown={event => {
                event.stopPropagation();

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

                const movingPoint = movementPoints[movementReferenceCorner];
                const anchorPoint = anchorPoints[movementReferenceCorner];

                const { x: planeX, y: planeY } = getPlaneCoordinatesFromEvent(
                  event
                );
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
          tabIndex={!disabled ? 0 : undefined}
          onFocus={() => this.setState({ active: true })}
          onBlur={() => this.setState({ active: false })}
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
            onKeyDown(event);

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
                onDelete();
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
        >
          <WrappedComponent
            isDragging={isMouseDown}
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

  ItemHOC.propTypes = {
    constrainMove: PropTypes.func,
    constrainResize: PropTypes.func,
    disabled: PropTypes.bool,
    getPlaneCoordinatesFromEvent: PropTypes.func,
    height: PropTypes.number.isRequired,
    keyboardTransformMultiplier: PropTypes.number,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onKeyDown: PropTypes.func,
    scale: PropTypes.number,
    setMouseHandler: PropTypes.func,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  ItemHOC.defaultProps = {
    constrainMove: () => {},
    constrainResize: () => {},
    disabled: false,
    getPlaneCoordinatesFromEvent: () => {},
    keyboardTransformMultiplier: 1,
    onChange: () => {},
    onDelete: () => {},
    onKeyDown: () => {},
    scale: 1,
    setMouseHandler: () => {},
  };

  return ItemHOC;
}

export default wrapShape;
