import React from 'react';
import PropTypes from 'prop-types';

function wrapChild(WrappedComponent) {
  const ItemHOC = class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        hasDragStarted: false,
        dragStartCoordinates: null,
        dragCurrentCoordinates: null,
      };

      this.onMouseUp = this.onMouseUp.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
    }

    componentDidMount() {
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('mousemove', this.onMouseMove);
    }

    onMouseUp() {
      if (!this.state.hasDragStarted) {
        return;
      }

      const { onChange, x, y } = this.props;
      const { dragStartCoordinates, dragCurrentCoordinates } = this.state;

      const nextX = x + dragCurrentCoordinates.x - dragStartCoordinates.x;
      const nextY = y + dragCurrentCoordinates.y - dragStartCoordinates.y;

      this.setState(
        {
          hasDragStarted: false,
          dragStartCoordinates: null,
          dragCurrentCoordinates: null,
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

    onMouseMove(event) {
      if (!this.state.hasDragStarted) {
        return;
      }
      const { scale } = this.props;

      const coords = { x: event.clientX / scale, y: event.clientY / scale };
      this.setState({ dragCurrentCoordinates: coords });
    }

    render() {
      const { scale, pointerEvents, ...otherProps } = this.props;
      const {
        hasDragStarted,
        dragStartCoordinates,
        dragCurrentCoordinates,
      } = this.state;
      const dragDeltaX = !hasDragStarted
        ? 0
        : dragCurrentCoordinates.x - dragStartCoordinates.x;
      const dragDeltaY = !hasDragStarted
        ? 0
        : dragCurrentCoordinates.y - dragStartCoordinates.y;
      const scaledX = (this.props.x + dragDeltaX) * scale;
      const scaledY = (this.props.y + dragDeltaY) * scale;
      const scaledWidth = this.props.width * scale;
      const scaledHeight = this.props.height * scale;

      return (
        <div
          className="rre-child-wrapper"
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
            const coords = {
              x: event.clientX / scale,
              y: event.clientY / scale,
            };
            this.setState({
              hasDragStarted: true,
              dragStartCoordinates: coords,
              dragCurrentCoordinates: coords,
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
    scale: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    pointerEvents: PropTypes.string,
  };

  ItemHOC.defaultProps = {
    scale: 1,
    pointerEvents: 'auto',
  };

  return ItemHOC;
}

export default wrapChild;
