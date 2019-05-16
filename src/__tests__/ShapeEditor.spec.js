/* eslint-disable react/prop-types */
import React from 'react';
import { mount } from 'enzyme';
import { withProfiler } from 'jest-react-profiler';
import ShapeEditor from '../ShapeEditor';
import SelectionLayer from '../SelectionLayer';
import wrapShape from '../wrapShape';

const exampleShapeProps = {
  x: 10,
  y: 20,
  height: 100,
  width: 300,
  shapeId: 'a',
};

// Note: this is extremely important to the performance of the component
// when there are many shapes rendered. Do not skip it if it starts to fail.
// Fix whatever excess render calls are being made
test('shapes are not re-rendered when their siblings change', () => {
  const InnerComponent = ({ width, height }) => (
    <rect width={width} height={height} />
  );

  const ShapeEditorProfiled = withProfiler(ShapeEditor);
  const SelectionLayerProfiled = withProfiler(SelectionLayer);
  const InnerComponentProfiled1 = withProfiler(InnerComponent);
  const InnerComponentProfiled2 = withProfiler(InnerComponent);
  const Shape1 = wrapShape(InnerComponentProfiled1);
  const Shape2 = wrapShape(InnerComponentProfiled2);

  const wrapper = mount(
    // We wrap it with an ad-hoc component in order to allow setProps to affect
    // InnerComponentProfiled2 props directly
    React.createElement((extraProps = {}) => (
      <ShapeEditorProfiled>
        <Shape1 {...exampleShapeProps} />
        <Shape2 {...exampleShapeProps} {...extraProps} />
      </ShapeEditorProfiled>
    ))
  );

  // Check that each component's render function was called just once
  expect(ShapeEditorProfiled).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled1).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled2).toHaveCommittedTimes(1);

  // Triggering a re-render of InnerComponentProfiled2
  wrapper.setProps({ width: 200 });

  // These check the number of extra commits since the last check
  // We want to make sure that InnerComponentProfiled1 didn't get re-rendered
  // even though nothing in its props was changed.
  expect(ShapeEditorProfiled).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled1).toHaveCommittedTimes(0); // Important
  expect(InnerComponentProfiled2).toHaveCommittedTimes(1);

  // Do it again, but this time wrapped in a selection layer
  const wrapper2 = mount(
    React.createElement((extraProps = {}) => (
      <ShapeEditorProfiled>
        <SelectionLayerProfiled
          onSelectionChange={() => {}}
          selectedShapeIds={[]}
        >
          <Shape1 {...exampleShapeProps} />
          <Shape2 {...exampleShapeProps} {...extraProps} />
        </SelectionLayerProfiled>
      </ShapeEditorProfiled>
    ))
  );

  // Check that each component's render function was called just once
  expect(ShapeEditorProfiled).toHaveCommittedTimes(1);
  expect(SelectionLayerProfiled).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled1).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled2).toHaveCommittedTimes(1);

  // Triggering a re-render of InnerComponentProfiled2
  wrapper2.setProps({ width: 200 });

  // These check the number of extra commits since the last check
  // We want to make sure that InnerComponentProfiled1 didn't get re-rendered
  // even though nothing in its props was changed.
  expect(ShapeEditorProfiled).toHaveCommittedTimes(1);
  expect(SelectionLayerProfiled).toHaveCommittedTimes(1);
  expect(InnerComponentProfiled1).toHaveCommittedTimes(0); // Important
  expect(InnerComponentProfiled2).toHaveCommittedTimes(1);
});
