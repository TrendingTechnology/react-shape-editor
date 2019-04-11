import React from 'react';
import PropTypes from 'prop-types';

function wrapChild(WrappedComponent) {
  const ItemHOC = class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        hasDragStarted: false,
        dragCurrentCoordinates: null,
        dragInnerOffset: null,
      };

      this.onMouseUp = this.onMouseUp.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.getParentCoordinatesFromEvent = this.getParentCoordinatesFromEvent.bind(
        this
      );
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

      const coords = this.getParentCoordinatesFromEvent(event);
      if (coords) {
        this.setState({ dragCurrentCoordinates: coords });
      }
    }

    onMouseUp() {
      if (!this.state.hasDragStarted) {
        return;
      }

      const { onChange } = this.props;
      const { dragCurrentCoordinates } = this.state;

      const { x: nextX, y: nextY } = dragCurrentCoordinates;

      this.setState(
        {
          hasDragStarted: false,
          dragCurrentCoordinates: null,
          dragInnerOffset: null,
        },
        () => {
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
      );
    }

    getParentCoordinatesFromEvent(
      event,
      dragInnerOffset = this.state.dragInnerOffset
    ) {
      const { scale, constrainMove, width, height } = this.props;
      let planeContainer = event.target;
      while (
        planeContainer &&
        (!planeContainer.dataset || !planeContainer.dataset.isPlaneContainer)
      ) {
        planeContainer = planeContainer.parentNode;
      }

      // If this event did not take place inside the plane, ignore it
      if (!planeContainer) {
        return null;
      }

      const { top, left } = planeContainer.getBoundingClientRect();
      const rawX = (event.clientX - left) / scale - dragInnerOffset.x;
      const rawY = (event.clientY - top) / scale - dragInnerOffset.y;
      const { x, y } = constrainMove({ x: rawX, y: rawY, width, height });

      return { x, y };
    }

    render() {
      const { scale, pointerEvents, ...otherProps } = this.props;
      const { hasDragStarted, dragCurrentCoordinates } = this.state;

      const scaledX =
        (hasDragStarted ? dragCurrentCoordinates.x : this.props.x) * scale;
      const scaledY =
        (hasDragStarted ? dragCurrentCoordinates.y : this.props.y) * scale;
      const scaledWidth = this.props.width * scale;
      const scaledHeight = this.props.height * scale;

      return (
        <div
          className="rse-child-wrapper"
          style={{
            boxSizing: 'border-box',
            height: scaledHeight,
            width: scaledWidth,
            position: 'absolute',
            top: scaledY,
            left: scaledX,
            cursor: 'move',
            pointerEvents,
          }}
          onMouseDown={event => {
            const { top, left } = event.target.getBoundingClientRect();
            const dragInnerOffset = {
              x: (event.clientX - left) / scale,
              y: (event.clientY - top) / scale,
            };

            const coords = this.getParentCoordinatesFromEvent(
              event,
              dragInnerOffset
            );

            this.setState({
              hasDragStarted: true,
              dragCurrentCoordinates: coords,
              dragInnerOffset,
            });
            event.stopPropagation();
          }}
        >
          <WrappedComponent {...otherProps} />
        </div>
      );
    }
  };

  ItemHOC.propTypes = {
    constrainMove: PropTypes.func,
    constrainResize: PropTypes.func,
    scale: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    pointerEvents: PropTypes.string,
  };

  ItemHOC.defaultProps = {
    constrainMove: () => {},
    constrainResize: () => {},
    scale: 1,
    pointerEvents: 'auto',
  };

  return ItemHOC;
}

export default wrapChild;
