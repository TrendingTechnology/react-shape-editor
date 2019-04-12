import React from 'react';
import wrapShape from './wrapShape';

const SingleLineShape = ({ width, height, scale }) => {
  const strokeWidth = 2 / scale;
  return (
    <rect
      width={Math.max(0, width - strokeWidth)}
      height={Math.max(0, height - strokeWidth)}
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      fill="rgba(0,0,255,0.5)"
      stroke="rgba(0,0,255,0.9)"
      strokeWidth={strokeWidth}
    />
  );
};

export default wrapShape(SingleLineShape);
