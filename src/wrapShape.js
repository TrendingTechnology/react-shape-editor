import React from 'react';
import PropTypes from 'prop-types';
import { getRectFromCornerCoordinates } from './utils';

const defaultDragState = {
  hasDragStarted: false,
  dragStartCoordinates: null,
  dragCurrentCoordinates: null,
  dragInnerOffset: null,
  dragLock: null,
};

const getPlaneContainer = node => {
  let planeContainer = node;
  while (
    planeContainer &&
    (!planeContainer.dataset || !planeContainer.dataset.isPlaneContainer)
  ) {
    planeContainer = planeContainer.parentNode;
  }

  return planeContainer;
};

// Smooths out some of the hairy issues of dealing with
// numbers like 19.9999999999245
const highPrecisionRound = (n, digits = 5) => {
  const factor = Math.pow(10, digits);
  return Math.round(n * factor) / factor;
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
    }

    componentDidMount() {
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('mousemove', this.onMouseMove);
    }

    onMouseMove(event) {
      if (!this.state.hasDragStarted) {
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
      if (!this.state.hasDragStarted) {
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

    getParentCoordinatesForMove(
      event,
      dragInnerOffset = this.state.dragInnerOffset
    ) {
      // If this event did not take place inside the plane, ignore it
      const planeContainer = getPlaneContainer(event.target);
      if (!planeContainer) {
        return null;
      }

      const { scale, constrainMove, width, height } = this.props;

      const { top, left } = planeContainer.getBoundingClientRect();
      const rawX = highPrecisionRound(
        (event.clientX - left) / scale - dragInnerOffset.x
      );
      const rawY = highPrecisionRound(
        (event.clientY - top) / scale - dragInnerOffset.y
      );
      const { x, y } = constrainMove({ x: rawX, y: rawY, width, height });

      return { x, y };
    }

    getParentCoordinatesForResize(
      event,
      dragStartCoordinates = this.state.dragStartCoordinates,
      dragCurrentCoordinates = this.state.dragCurrentCoordinates,
      dragInnerOffset = this.state.dragInnerOffset,
      dragLock = this.state.dragLock
    ) {
      // If this event did not take place inside the plane, ignore it
      const planeContainer = getPlaneContainer(event.target);
      if (!planeContainer) {
        return null;
      }

      const { scale, constrainResize, width, height } = this.props;

      const { top, left } = planeContainer.getBoundingClientRect();
      const rawX = highPrecisionRound(
        (event.clientX - left) / scale - dragInnerOffset.x
      );
      const rawY = highPrecisionRound(
        (event.clientY - top) / scale - dragInnerOffset.y
      );

      const { x, y } = constrainResize({
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

    forceFocus() {
      this.wrapperEl.focus();
    }

    render() {
      const {
        constrainMove,
        constrainResize,
        isPlaneDragging,
        onChange,
        onDelete,
        onKeyDown,
        scale,
        ...otherProps
      } = this.props;
      const {
        active,
        hasDragStarted,
        dragStartCoordinates,
        dragCurrentCoordinates,
      } = this.state;

      const sides = {
        left: !hasDragStarted
          ? this.props.x
          : Math.min(dragStartCoordinates.x, dragCurrentCoordinates.x),
        right: !hasDragStarted
          ? this.props.x + this.props.width
          : Math.max(dragStartCoordinates.x, dragCurrentCoordinates.x),
        top: !hasDragStarted
          ? this.props.y
          : Math.min(dragStartCoordinates.y, dragCurrentCoordinates.y),
        bottom: !hasDragStarted
          ? this.props.y + this.props.height
          : Math.max(dragStartCoordinates.y, dragCurrentCoordinates.y),
      };

      const SPACIOUS_PIXELS = 20;
      const hasSpaciousVertical =
        (sides.bottom - sides.top) * scale > SPACIOUS_PIXELS;
      const hasSpaciousHorizontal =
        (sides.right - sides.left) * scale > SPACIOUS_PIXELS;
      const handles = [
        hasSpaciousHorizontal && ['n', 'ne', 'ns-resize', '50%', 0, 'x'],
        ['ne', 'ne', 'nesw-resize', '100%', 0, null],
        hasSpaciousVertical && ['e', 'se', 'ew-resize', '100%', '50%', 'y'],
        ['se', 'se', 'nwse-resize', '100%', '100%', null],
        hasSpaciousHorizontal && ['s', 'sw', 'ns-resize', '50%', '100%', 'x'],
        ['sw', 'sw', 'nesw-resize', 0, '100%', null],
        hasSpaciousVertical && ['w', 'nw', 'ew-resize', 0, '50%', 'y'],
        ['nw', 'nw', 'nwse-resize', 0, 0, null],
      ]
        .filter(a => a)
        .map(
          (
            [handleName, movementReferenceCorner, cursor, left, top, dragLock],
            index
          ) => (
            <div
              key={handleName}
              style={{
                ...(active
                  ? { background: 'rgba(255,0,0,0.8)' }
                  : {
                      background: 'rgba(255,0,0,0.2)',
                      border: 'solid rgba(255,0,0,0.3) 1px',
                    }),
                position: 'absolute',
                width: SPACIOUS_PIXELS / 2,
                height: SPACIOUS_PIXELS / 2,
                top,
                left,
                cursor,
                // Note: the dragInnerOffset calculation is dependent on this transform
                // (which simulates center-origin)
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={event => {
                event.stopPropagation();
                const {
                  top,
                  left,
                  width,
                  height,
                } = event.target.getBoundingClientRect();
                const dragInnerOffset = {
                  x: (event.clientX - left - width / 2) / scale,
                  y: (event.clientY - top - height / 2) / scale,
                };

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
                const updatedMovingPoint = this.getParentCoordinatesForResize(
                  event,
                  anchorPoint,
                  movingPoint,
                  dragInnerOffset,
                  dragLock
                );

                this.setState({
                  hasDragStarted: true,
                  dragStartCoordinates: anchorPoint,
                  dragCurrentCoordinates: updatedMovingPoint,
                  dragInnerOffset,
                  isDragToMove: false,
                  dragLock,
                });
              }}
            />
          )
        );

      return (
        <div
          className="rse-shape-wrapper"
          style={{
            boxSizing: 'border-box',
            height: (sides.bottom - sides.top) * scale,
            width: (sides.right - sides.left) * scale,
            position: 'absolute',
            top: sides.top * scale,
            left: sides.left * scale,
            cursor: 'move',
            outline: 'none',
            pointerEvents:
              this.props.disabled || isPlaneDragging ? 'none' : 'auto',
          }}
          ref={el => {
            this.wrapperEl = el;
          }}
          tabIndex={!this.props.disabled ? 0 : undefined}
          onFocus={() => this.setState({ active: true })}
          onBlur={() => this.setState({ active: false })}
          onMouseDown={event => {
            event.stopPropagation();
            const { top, left } = event.target.getBoundingClientRect();
            const dragInnerOffset = {
              x: (event.clientX - left) / scale,
              y: (event.clientY - top) / scale,
            };

            const coords = this.getParentCoordinatesForMove(
              event,
              dragInnerOffset
            );

            this.setState({
              hasDragStarted: true,
              dragCurrentCoordinates: coords,
              dragStartCoordinates: {
                x: coords.x + this.props.width,
                y: coords.y + this.props.height,
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
            switch (event.key) {
              case 'Backspace':
                onDelete();
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
            isDragging={hasDragStarted}
            active={active}
            {...otherProps}
          />
          {!this.props.disabled && handles}
        </div>
      );
    }
  };

  ItemHOC.propTypes = {
    constrainMove: PropTypes.func,
    constrainResize: PropTypes.func,
    disabled: PropTypes.bool,
    height: PropTypes.number.isRequired,
    isPlaneDragging: PropTypes.bool,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onKeyDown: PropTypes.func,
    scale: PropTypes.number,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  ItemHOC.defaultProps = {
    constrainMove: () => {},
    constrainResize: () => {},
    isPlaneDragging: false,
    onChange: () => {},
    onDelete: () => {},
    onKeyDown: () => {},
    disabled: false,
    scale: 1,
  };

  return ItemHOC;
}

export default wrapShape;
