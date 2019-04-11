import React from 'react';
import wrapShape from './wrapShape';

const SingleLineShape = () => (
  <div
    style={{
      height: '100%',
      boxSizing: 'border-box',
      background: 'rgba(0,0,255,0.5)',
      border: 'solid 2px rgba(0,0,255,0.9)',
    }}
  />
);

export default wrapShape(SingleLineShape);
