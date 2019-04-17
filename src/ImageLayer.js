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
    const { onLoad, src, ...otherProps } = this.props;
    const { naturalHeight, naturalWidth } = this.state;

    return (
      <image
        href={src}
        width={naturalWidth}
        height={naturalHeight}
        {...otherProps}
      />
    );
  }
}

ImageLayer.propTypes = {
  onLoad: PropTypes.func,
  src: PropTypes.string.isRequired,
};

ImageLayer.defaultProps = {
  onLoad: () => {},
};

ImageLayer.rseType = 'ImageLayer';

export default ImageLayer;
