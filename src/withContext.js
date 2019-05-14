import React, { useContext } from 'react';
import {
  CallbacksContext,
  VectorHeightContext,
  VectorWidthContext,
  ScaleContext,
} from './ShapeEditor';

function withContext(Component) {
  function ComponentWithRseContext(props) {
    const callbacks = useContext(CallbacksContext);
    const vectorHeight = useContext(VectorHeightContext);
    const vectorWidth = useContext(VectorWidthContext);
    const scale = useContext(ScaleContext);
    return (
      <Component
        {...props}
        {...callbacks}
        vectorHeight={vectorHeight}
        vectorWidth={vectorWidth}
        scale={scale}
      />
    );
  }

  return ComponentWithRseContext;
}

export default withContext;
