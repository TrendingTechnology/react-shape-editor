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
        nativeActive: false,
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

    componentDidUpdate(prevProps) {
      if (
        this.props.height !== prevProps.height ||
        this.props.width !== prevProps.width ||
        this.props.x !== prevProps.x ||
        this.props.y !== prevProps.y
      ) {
        this.props.onChildRectChanged(
          this.props.shapeId,
          this.props.isInternalComponent
        );
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
          const { width, height } = this.props;
          const right = coords.x + width;
          const bottom = coords.y + height;

          this.setState({
            dragCurrentCoordinates: coords,
            dragStartCoordinates: { x: right, y: bottom },
          });

          this.props.onIntermediateChange({
            x: coords.x,
            y: coords.y,
            width,
            height,
          });
        }
      } else {
        const coords = this.getParentCoordinatesForResize(event);
        if (coords) {
          this.setState({
            dragCurrentCoordinates: coords,
          });

          this.props.onIntermediateChange(
            getRectFromCornerCoordinates(
              coords,
              this.state.dragStartCoordinates
            )
          );
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
          if (nextX !== this.props.x || nextY !== this.props.y) {
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
        });
      } else {
        this.setState(defaultDragState, () => {
          const nextRect = getRectFromCornerCoordinates(
            dragStartCoordinates,
            dragCurrentCoordinates
          );
          if (
            nextRect.height !== this.props.height ||
            nextRect.width !== this.props.width ||
            nextRect.x !== this.props.x ||
            nextRect.y !== this.props.y
          ) {
            onChange(nextRect, this.props);
          }
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

    simulateTransform(nextRect) {
      cancelAnimationFrame(this.simulatedTransform);

      if (!nextRect) {
        this.setState(defaultDragState);
        return;
      }

      this.simulatedTransform = window.requestAnimationFrame(() => {
        this.setState(() => ({
          isMouseDown: true,
          dragStartCoordinates: { x: nextRect.x, y: nextRect.y },
          dragCurrentCoordinates: {
            x: nextRect.x + nextRect.width,
            y: nextRect.y + nextRect.height,
          },
        }));
      });
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
      const { constrainResize, getPlaneCoordinatesFromEvent } = this.props;
      const { x: rawX, y: rawY } = getPlaneCoordinatesFromEvent(
        event,
        dragInnerOffset
      );

      const { x, y } = constrainResize({
        originalMovingCorner: dragCurrentCoordinates,
        startCorner: dragStartCoordinates,
        movingCorner: { x: rawX, y: rawY },
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
        isInternalComponent,
        onBlur,
        onChange,
        onChildFocus,
        onChildToggleSelection,
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
        active: artificialActive,
        disabled,
        isInSelectionGroup,
        scale,
        shapeId,
      } = this.props;
      const {
        nativeActive,
        isMouseDown,
        dragStartCoordinates,
        dragCurrentCoordinates,
      } = this.state;

      const active =
        artificialActive !== null ? artificialActive : nativeActive;

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
              nativeActive={nativeActive}
              cursor={cursor}
              isInSelectionGroup={isInSelectionGroup}
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
          data-shape-id={shapeId}
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
            onChildFocus(shapeId, isInternalComponent);
            this.setState({ nativeActive: true });
            onFocus(event, this.props);
          }}
          onBlur={event => {
            this.setState({ nativeActive: false });
            onBlur(event, this.props);
          }}
          onMouseDown={event => {
            event.stopPropagation();

            if (event.shiftKey) {
              onChildToggleSelection(shapeId, isInternalComponent, event);

              // Prevent default to keep this from triggering blur/focus events
              // on the elements involved, which would otherwise cause a wave
              // of event listener callbacks that are not needed.
              event.preventDefault();
              return;
            }

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
              case 'Delete':
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
            nativeActive={nativeActive}
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
    active: PropTypes.bool,
    constrainMove: PropTypes.func,
    constrainResize: PropTypes.func,
    disabled: PropTypes.bool,
    getPlaneCoordinatesFromEvent: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    isInSelectionGroup: PropTypes.bool,
    isInternalComponent: PropTypes.bool,
    keyboardTransformMultiplier: PropTypes.number,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onChildRectChanged: PropTypes.func,
    onChildFocus: PropTypes.func,
    onChildToggleSelection: PropTypes.func,
    onDelete: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyDown: PropTypes.func,
    onIntermediateChange: PropTypes.func,
    onShapeMountedOrUnmounted: PropTypes.func.isRequired,
    ResizeHandleComponent: PropTypes.func,
    scale: PropTypes.number.isRequired,
    shapeId: PropTypes.string.isRequired,
    setMouseHandler: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    wrapperProps: PropTypes.shape({}),
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  WrappedShape.defaultProps = {
    active: null,
    constrainMove: defaultConstrainMove,
    constrainResize: defaultConstrainResize,
    disabled: false,
    isInSelectionGroup: false,
    isInternalComponent: false,
    keyboardTransformMultiplier: 1,
    onBlur: () => {},
    onChange: () => {},
    onChildRectChanged: () => {},
    onChildFocus: () => {},
    onChildToggleSelection: () => {},
    onDelete: () => {},
    onFocus: () => {},
    onIntermediateChange: () => {},
    onKeyDown: () => {},
    ResizeHandleComponent: DefaultResizeHandleComponent,
    wrapperProps: {},
  };

  WrappedShape.displayName = `wrapShape(${WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component'})`;

  return withContext(WrappedShape);
}

export default wrapShape;
