import React, { Component } from 'react';
import PropTypes from 'prop-types';
import wrapChild from './wrapChild';
import {
  getScaledMouseCoordinates,
  getRectFromCornerCoordinates,
} from './utils';

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

  getCoordinatesFromEvent(event) {
    const { scale } = this.props;

    return getScaledMouseCoordinates(event, scale);
  }

  onDragFinish(event) {
    if (!this.state.hasDragStarted) {
      return;
    }

    const { dragStartCoordinates, dragCurrentCoordinates } = this.state;
    if (dragStartCoordinates === dragCurrentCoordinates) {
      this.setState({
        dragStartCoordinates: null,
        dragCurrentCoordinates: null,
        hasDragStarted: false,
      });
      return;
    }

    const { onAddChild } = this.props;

    const newRect = getRectFromCornerCoordinates(
      dragStartCoordinates,
      dragCurrentCoordinates
    );

    this.setState(
      {
        dragStartCoordinates: null,
        dragCurrentCoordinates: null,
        hasDragStarted: false,
      },
      () => {
        onAddChild(newRect);
      }
    );
  }

  render() {
    const { backgroundSrc, children, scale } = this.props;
    const {
      hasDragStarted,
      dragStartCoordinates,
      dragCurrentCoordinates,
    } = this.state;
    const { scaledWidth, scaledHeight } = this.getScaledDimensions();

    const draggedRect = hasDragStarted
      ? getRectFromCornerCoordinates(
          dragStartCoordinates,
          dragCurrentCoordinates
        )
      : null;

    return (
      <div
        className="rre-container"
        style={{ overflow: 'auto', height: '100%', userSelect: 'none' }}
      >
        {backgroundSrc ? (
          <div
            className="rre-image-container"
            style={{
              backgroundImage: `url(${backgroundSrc})`,
              backgroundSize: 'cover',
              height: scaledHeight,
              width: scaledWidth,
              position: 'relative',
              overflow: 'hidden',
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
                x={draggedRect.x}
                y={draggedRect.y}
                width={draggedRect.width}
                height={draggedRect.height}
                scale={scale}
                pointerEvents="none"
                onChange={() => {}}
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
