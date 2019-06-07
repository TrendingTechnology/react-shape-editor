import React from 'react';
import wrapShape from './wrapShape';

const DefaultSelectionDrawComponent = wrapShape(({ height, width }) => (
  <rect fill="rgba(140,179,255,0.3)" height={height} width={width} />
));

export default DefaultSelectionDrawComponent;
