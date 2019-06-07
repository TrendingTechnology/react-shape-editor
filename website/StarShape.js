/* eslint-disable react/no-unused-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { wrapShape } from '../src';

const starPoints = '350,75 379,161 469,161 397,215 423,301 350,250 277,301 303,215 231,161 321,161'
  .split(' ')
  .map(coord => coord.split(','));

const maxY = Math.max(...starPoints.map(([, y]) => y));
const minY = Math.min(...starPoints.map(([, y]) => y));
const maxX = Math.max(...starPoints.map(([x]) => x));
const minX = Math.min(...starPoints.map(([x]) => x));

const starPointsNormalized = starPoints.map(([x, y]) => [
  (x - minX) / (maxX - minX),
  (y - minY) / (maxY - minY),
]);

const StarShape = ({ width, height }) => {
  return (
    <polygon
      points={starPointsNormalized
        .map(([x, y]) => [x * width, y * height].join(','))
        .join(' ')}
      fill="rgba(155,50,50,1)"
    />
  );
};

StarShape.propTypes = {
  disabled: PropTypes.bool,
  height: PropTypes.number,
  isBeingChanged: PropTypes.bool,
  scale: PropTypes.number,
  width: PropTypes.number,
};

StarShape.defaultProps = {
  disabled: false,
  height: 0,
  isBeingChanged: false,
  scale: 1,
  width: 0,
};

export default wrapShape(StarShape);
