/* eslint-disable react/no-unused-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { wrapShape } from '../src';

const OvalShape = ({ width, height }) => {
  return (
    <ellipse
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      fill="rgba(50,155,50,0.9)"
    />
  );
};

OvalShape.propTypes = {
  disabled: PropTypes.bool,
  height: PropTypes.number,
  isBeingChanged: PropTypes.bool,
  scale: PropTypes.number,
  width: PropTypes.number,
};

OvalShape.defaultProps = {
  disabled: false,
  height: 0,
  isBeingChanged: false,
  scale: 1,
  width: 0,
};

export default wrapShape(OvalShape);
