import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ImageLayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      naturalWidth: 0,
      naturalHeight: 0,
    };

    this.getImageDimensionInfo = this.getImageDimensionInfo.bind(this);
  }

  componentDidMount() {
    this.getImageDimensionInfo();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      this.getImageDimensionInfo();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  // Load the background image in memory to measure its dimensions
  getImageDimensionInfo() {
    const { src: initialSrc } = this.props;
    const memoryImage = new Image();

    memoryImage.onload = () => {
      if (this.unmounted || this.props.src !== initialSrc) {
        return;
      }

      this.setState({
        naturalWidth: memoryImage.naturalWidth,
        naturalHeight: memoryImage.naturalHeight,
      });
      this.props.onLoad({
        naturalWidth: memoryImage.naturalWidth,
        naturalHeight: memoryImage.naturalHeight,
      });
    };
    memoryImage.src = initialSrc;
  }

  render() {
    const {
      height,
      imageOffsetX,
      imageOffsetY,
      onLoad,
      src,
      width,
      ...otherProps
    } = this.props;
    const { naturalHeight, naturalWidth } = this.state;
    const clipPathId = `ImageLayer${src.replace(/\W/g, '-')}`;

    const displayWidth = width !== null ? width : naturalWidth;
    const displayHeight = height !== null ? height : naturalHeight;

    return (
      <React.Fragment>
        <clipPath id={clipPathId}>
          <rect width={displayWidth} height={displayHeight} />
        </clipPath>
        <image
          clipPath={`url(#${clipPathId})`}
          href={src}
          x={imageOffsetX}
          y={imageOffsetY}
          width={naturalWidth}
          height={naturalHeight}
          {...otherProps}
        />
      </React.Fragment>
    );
  }
}

ImageLayer.propTypes = {
  height: PropTypes.number,
  imageOffsetX: PropTypes.number,
  imageOffsetY: PropTypes.number,
  onLoad: PropTypes.func,
  src: PropTypes.string.isRequired,
  width: PropTypes.number,
};

ImageLayer.defaultProps = {
  height: null,
  imageOffsetX: 0,
  imageOffsetY: 0,
  onLoad: () => {},
  width: null,
};

ImageLayer.rseType = 'ImageLayer';

export default ImageLayer;
