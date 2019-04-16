import React from 'react';
import PropTypes from 'prop-types';

const DefaultResizeHandleComponent = ({
  active,
  cursor,
  recommendedSize,
  scale,
  x,
  y,
  ...otherProps
}) => (
  <rect
    x={x - recommendedSize / 2}
    y={y - recommendedSize / 2}
    width={recommendedSize}
    height={recommendedSize}
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
    {...otherProps}
  />
);

DefaultResizeHandleComponent.propTypes = {
  active: PropTypes.bool,
  cursor: PropTypes.string,
  recommendedSize: PropTypes.number,
  scale: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};

DefaultResizeHandleComponent.defaultProps = {
  active: false,
  cursor: undefined,
  recommendedSize: 0,
  scale: 1,
  x: 0,
  y: 0,
};

export default DefaultResizeHandleComponent;
