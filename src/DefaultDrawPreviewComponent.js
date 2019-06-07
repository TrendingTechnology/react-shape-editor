import React from 'react';
import wrapShape from './wrapShape';

const DefaultDrawPreviewComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(0,0,255,0.5)" height={height} width={width} />
));

export default DefaultDrawPreviewComponent;
