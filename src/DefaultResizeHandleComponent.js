import React from 'react';
import PropTypes from 'prop-types';

const DefaultResizeHandleComponent = ({
  active,
  cursor,
  onMouseDown,
  recommendedSize,
  scale,
  x,
  y,
}) => (
  <rect
    fill={active ? 'rgba(229,240,244,1)' : 'rgba(229,240,244,0.3)'}
    height={recommendedSize}
    stroke={active ? 'rgba(53,33,140,1)' : 'rgba(53,33,140,0.3)'}
    strokeWidth={1 / scale}
    style={{ cursor }}
    width={recommendedSize}
    x={x - recommendedSize / 2}
    y={y - recommendedSize / 2}
    // The onMouseDown prop must be passed on or resize will not work
    onMouseDown={onMouseDown}
  />
);

DefaultResizeHandleComponent.propTypes = {
  active: PropTypes.bool,
  cursor: PropTypes.string,
  onMouseDown: PropTypes.func,
  recommendedSize: PropTypes.number,
  scale: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};

DefaultResizeHandleComponent.defaultProps = {
  active: false,
  cursor: undefined,
  onMouseDown: () => {},
  recommendedSize: 0,
  scale: 1,
  x: 0,
  y: 0,
};

export default DefaultResizeHandleComponent;
