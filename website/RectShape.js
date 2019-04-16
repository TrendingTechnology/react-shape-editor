/* eslint-disable react/no-unused-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { wrapShape } from '../src';

const RectShape = ({ width, height, scale }) => {
  const strokeWidth = 2 / scale;
  return (
    <rect
      width={Math.max(0, width - strokeWidth)}
      height={Math.max(0, height - strokeWidth)}
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      fill="rgba(100,100,255,1)"
      stroke="rgba(0,0,0,1)"
      strokeWidth={strokeWidth}
    />
  );
};

RectShape.propTypes = {
  disabled: PropTypes.bool,
  height: PropTypes.number,
  isBeingChanged: PropTypes.bool,
  scale: PropTypes.number,
  width: PropTypes.number,
};

RectShape.defaultProps = {
  disabled: false,
  height: 0,
  isBeingChanged: false,
  scale: 1,
  width: 0,
};

export default wrapShape(RectShape);
