import React, { Component } from 'react';
import PropTypes from 'prop-types';
import wrapChild from './wrapChild';
import { getScaledMouseCoordinates } from './utils';

const DraggedOne = wrapChild(() => (
  <div style={{ background: 'rgba(0,0,255,0.5)', height: '100%' }} />
));

class RectEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bgWidth: 0,
      bgHeight: 0,
      dragStartCoordinates: null,
      dragCurrentCoordinates: null,
      hasDragStarted: false,
    };

    this.getImageDimensionInfo = this.getImageDimensionInfo.bind(this);
    this.getScaledDimensions = this.getScaledDimensions.bind(this);
    this.getCoordinatesInOriginal = this.getCoordinatesInOriginal.bind(this);
    this.getRectFromDragCoordinates = this.getRectFromDragCoordinates.bind(
      this
    );
    this.getCoordinatesFromEvent = this.getCoordinatesFromEvent.bind(this);
    this.onDragFinish = this.onDragFinish.bind(this);
  }

  componentDidMount() {
    this.getImageDimensionInfo();

    window.addEventListener('mouseup', this.onDragFinish);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.backgroundSrc !== this.props.backgroundSrc) {
      this.getImageDimensionInfo();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onDragFinish);
    this.unmounted = true;
  }

  // Load the background image in memory to measure its dimensions
  getImageDimensionInfo() {
    if (!this.props.backgroundSrc) {
      return;
    }

    const memoryImage = new Image();

    memoryImage.onload = () => {
      if (!this.unmounted) {
        this.setState({
          bgWidth: memoryImage.naturalWidth,
          bgHeight: memoryImage.naturalHeight,
        });
      }
    };
    memoryImage.src = this.props.backgroundSrc;
  }

  getScaledDimensions() {
    const { scale } = this.props;
    const { bgHeight, bgWidth } = this.state;

    return {
      scaledWidth: bgWidth * scale,
      scaledHeight: bgHeight * scale,
    };
  }

  getCoordinatesInOriginal(x, y) {
    const { scale } = this.props;
    return {
      x: x / scale,
      y: y / scale,
    };
  }

  getRectFromDragCoordinates() {
    const { dragStartCoordinates, dragCurrentCoordinates } = this.state;

    return {
      imageX: Math.min(
        dragStartCoordinates.imageX,
        dragCurrentCoordinates.imageX
      ),
      imageY: Math.min(
        dragStartCoordinates.imageY,
        dragCurrentCoordinates.imageY
      ),
      widthInImage: Math.abs(
        dragStartCoordinates.imageX - dragCurrentCoordinates.imageX
      ),
      heightInImage: Math.abs(
        dragStartCoordinates.imageY - dragCurrentCoordinates.imageY
      ),
    };
  }

  getCoordinatesFromEvent(event) {
    const { scale } = this.props;
    const { x: imageX, y: imageY } = getScaledMouseCoordinates(event, scale);

    return { imageX, imageY };
  }

  onDragFinish(event) {
    if (!this.state.hasDragStarted) {
      return;
    }
    if (this.state.dragStartCoordinates === this.state.dragCurrentCoordinates) {
      this.setState({
        dragStartCoordinates: null,
        dragCurrentCoordinates: null,
        hasDragStarted: false,
      });
      return;
    }

    const { onAddChild } = this.props;

    const {
      imageX,
      imageY,
      widthInImage,
      heightInImage,
    } = this.getRectFromDragCoordinates();

    this.setState(
      {
        dragStartCoordinates: null,
        dragCurrentCoordinates: null,
        hasDragStarted: false,
      },
      () => {
        onAddChild({
          x: imageX,
          y: imageY,
          width: widthInImage,
          height: heightInImage,
        });
      }
    );
  }

  render() {
    const { backgroundSrc, children, scale } = this.props;
    const { hasDragStarted } = this.state;
    const { scaledWidth, scaledHeight } = this.getScaledDimensions();
    const dims = hasDragStarted ? this.getRectFromDragCoordinates() : null;

    return (
      <div
        style={{ overflow: 'auto', height: '100%', userSelect: 'none' }}
        className="rect-editor"
      >
        {backgroundSrc ? (
          <div
            style={{
              backgroundImage: `url(${backgroundSrc})`,
              backgroundSize: 'cover',
              height: scaledHeight,
              width: scaledWidth,
              position: 'relative',
            }}
            onMouseDown={event => {
              const startCoordinates = this.getCoordinatesFromEvent(event);
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
                scale,
                pointerEvents: hasDragStarted ? 'none' : 'auto',
              })
            )}
            {hasDragStarted && (
              <DraggedOne
                x={dims.imageX}
                y={dims.imageY}
                width={dims.widthInImage}
                height={dims.heightInImage}
                scale={scale}
                pointerEvents="none"
                onDimensionChange={() => {}}
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

RectEditor.propTypes = {
  backgroundSrc: PropTypes.string.isRequired,
  scale: PropTypes.number,
  children: PropTypes.node,
  onAddChild: PropTypes.func.isRequired,
};

RectEditor.defaultProps = {
  scale: 1,
  children: null,
};

export default RectEditor;
