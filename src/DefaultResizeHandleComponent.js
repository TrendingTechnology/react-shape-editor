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
        ? { fill: 'rgba(229,240,244,1)', stroke: 'rgba(53,33,140,1)' }
        : {
            fill: 'rgba(229,240,244,0.3)',
            stroke: 'rgba(53,33,140,0.3)',
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
