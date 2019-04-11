import React from 'react';
import PropTypes from 'prop-types';
// import { getScaledMouseCoordinates } from './utils';

function wrapChild(WrappedComponent) {
  const ItemHOC = class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        hasDragStarted: false,
      };

      this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentDidMount() {
      window.addEventListener('mouseup', this.onMouseUp);
    }

    componentWillUnmount() {
      window.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseUp() {
      if (!this.state.hasDragStarted) {
        return;
      }

      this.setState({ hasDragStarted: false });
    }

    render() {
      const { scale, pointerEvents, ...otherProps } = this.props;
      const scaledX = this.props.x * scale;
      const scaledY = this.props.y * scale;
      const scaledWidth = this.props.width * scale;
      const scaledHeight = this.props.height * scale;

      return (
        <div
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
            // const coords = getScaledMouseCoordinates(event, scale);
            // console.log('ctodo((((coords))))', coords); // eslint-disable-line no-console
            const coords = { x: event.clientX, y: event.clientY };
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
    onDimensionChange: PropTypes.func,
    pointerEvents: PropTypes.string,
  };

  ItemHOC.defaultProps = {
    scale: 1,
    pointerEvents: 'auto',
  };

  return ItemHOC;
}

export default wrapChild;
