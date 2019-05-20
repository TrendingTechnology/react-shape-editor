# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.2.0](https://github.com/fritz-c/react-shape-editor/compare/v2.1.2...v2.2.0) (2019-05-20)


### Features

* add prop to customize SelectionComponent's props ([2bf3a62](https://github.com/fritz-c/react-shape-editor/commit/2bf3a62))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.2](https://github.com/fritz-c/react-shape-editor/compare/v2.1.1...v2.1.2) (2019-05-20)


### Bug Fixes

* remove unnecessary focus clearing on shape add/delete ([389c28e](https://github.com/fritz-c/react-shape-editor/commit/389c28e))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.1](https://github.com/fritz-c/react-shape-editor/compare/v2.1.0...v2.1.1) (2019-05-17)


### Bug Fixes

* remove excess props from svg node ([4ea3dfe](https://github.com/fritz-c/react-shape-editor/commit/4ea3dfe))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.1.0](https://github.com/fritz-c/react-shape-editor/compare/v2.0.1...v2.1.0) (2019-05-17)


### Features

* add props to disable focus-on-add/delete behavior ([0d857fb](https://github.com/fritz-c/react-shape-editor/commit/0d857fb))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.1](https://github.com/fritz-c/react-shape-editor/compare/v2.0.0...v2.0.1) (2019-05-17)


### Performance Improvements

* skip unnecessary extra render for selection ([7f10dc1](https://github.com/fritz-c/react-shape-editor/commit/7f10dc1))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.0.0](https://github.com/fritz-c/react-shape-editor/compare/v1.2.1...v2.0.0) (2019-05-16)


### Bug Fixes

* remove incorrect parameter sent to constrainResize ([695a30e](https://github.com/fritz-c/react-shape-editor/commit/695a30e))


### Code Refactoring

* require unique shapeId for each shape ([e90014d](https://github.com/fritz-c/react-shape-editor/commit/e90014d))


### Features

* enable multiple selections with SelectionLayer ([5679c45](https://github.com/fritz-c/react-shape-editor/commit/5679c45))


### BREAKING CHANGES

* the original width and height of the shape are no
longer provided as callback parameters to constrainResize. They can
still be derived from the coordinates inside originalMovingCorner
and startCorner, however.
* each shape now requires a unique shapeId string



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.1](https://github.com/fritz-c/react-shape-editor/compare/v1.2.0...v1.2.1) (2019-04-26)


### Bug Fixes

* handle case when child node is null ([90b4955](https://github.com/fritz-c/react-shape-editor/commit/90b4955))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [1.2.0](https://github.com/fritz-c/react-shape-editor/compare/v1.1.1...v1.2.0) (2019-04-25)


### Features

* pass the shape props on callbacks for easier render optimization ([700bc0f](https://github.com/fritz-c/react-shape-editor/commit/700bc0f))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.1](https://github.com/fritz-c/react-shape-editor/compare/v1.1.0...v1.1.1) (2019-04-24)


### Performance Improvements

* avoid unnecessary shape re-render ([f9dc010](https://github.com/fritz-c/react-shape-editor/commit/f9dc010))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [1.1.0](https://github.com/fritz-c/react-shape-editor/compare/v1.0.1...v1.1.0) (2019-04-24)


### Features

* add wrapperProps prop to give props directly to wrapper ([4be6f1e](https://github.com/fritz-c/react-shape-editor/commit/4be6f1e))
* pass the event object that triggered onDelete to the callback ([6201a68](https://github.com/fritz-c/react-shape-editor/commit/6201a68))


### Performance Improvements

* use React.PureComponent in the wrapper for performance ([622ae10](https://github.com/fritz-c/react-shape-editor/commit/622ae10))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.1](https://github.com/fritz-c/react-shape-editor/compare/v1.0.0...v1.0.1) (2019-04-17)


### Bug Fixes

* make initial focus work after mount ([f1bd886](https://github.com/fritz-c/react-shape-editor/commit/f1bd886))
* rearrange handle order to look better when overlapped ([da4c4e0](https://github.com/fritz-c/react-shape-editor/commit/da4c4e0))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [1.0.0](https://github.com/fritz-c/react-shape-editor/compare/v0.1.0...v1.0.0) (2019-04-17)


### Bug Fixes

* make it work in IE11 ([a1dd766](https://github.com/fritz-c/react-shape-editor/commit/a1dd766))
* prevent bug where focus would snap to other shape on click ([cb9b6d0](https://github.com/fritz-c/react-shape-editor/commit/cb9b6d0))


### Code Refactoring

* move DrawLayer out into its own component ([8b4ab74](https://github.com/fritz-c/react-shape-editor/commit/8b4ab74))
* move image layer into its own component ([c2a4270](https://github.com/fritz-c/react-shape-editor/commit/c2a4270))


### Features

* allow custom onFocus/onBlur logic ([b1a8d7c](https://github.com/fritz-c/react-shape-editor/commit/b1a8d7c))
* allow for custom corner component ([448ca64](https://github.com/fritz-c/react-shape-editor/commit/448ca64))
* implement refocus after deletion, focusing on the previous shape in order ([e6e00fc](https://github.com/fritz-c/react-shape-editor/commit/e6e00fc))
* modify deletion focus logic to go to closest neighbor position-wise ([a6ae2ff](https://github.com/fritz-c/react-shape-editor/commit/a6ae2ff))


### Performance Improvements

* fix slow image rendering performance ([28bae81](https://github.com/fritz-c/react-shape-editor/commit/28bae81))


### BREAKING CHANGES

* DrawLayer must be added manually, and many props were
accordingly migrated away from ShapeEditor to their corresponding
components
* planeImageSrc no longer works. Use ImageLayer instead



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 0.1.0 (2019-04-15)


### Bug Fixes

* add fix for big shifts in location during resize at some zoom levels ([49b8b52](https://github.com/fritz-c/react-shape-editor/commit/49b8b52))
* handle some more hairy precision problems ([1d708cb](https://github.com/fritz-c/react-shape-editor/commit/1d708cb))


### Features

* add API to restrain movement and resizing ([5d7c441](https://github.com/fritz-c/react-shape-editor/commit/5d7c441))
* add concept of focus to shapes ([3f27a6f](https://github.com/fritz-c/react-shape-editor/commit/3f27a6f))
* add deletion via backspace key ([a0615de](https://github.com/fritz-c/react-shape-editor/commit/a0615de))
* add keyboard shortcuts for moving and resizing ([d5a100b](https://github.com/fritz-c/react-shape-editor/commit/d5a100b))
* add resizing ([ac9fa9a](https://github.com/fritz-c/react-shape-editor/commit/ac9fa9a))
* add the ability to disable drawing mode ([27f9813](https://github.com/fritz-c/react-shape-editor/commit/27f9813))
* allow the user to disable interaction on a per-shape basis ([c295806](https://github.com/fritz-c/react-shape-editor/commit/c295806))
* allow the user to specify the appearance of the draw preview ([fdd9043](https://github.com/fritz-c/react-shape-editor/commit/fdd9043))
* make it non-scrolling by default ([2a7fbf6](https://github.com/fritz-c/react-shape-editor/commit/2a7fbf6))
* move shapes ([5fe4892](https://github.com/fritz-c/react-shape-editor/commit/5fe4892))
* provide pre-transform coordinates to the constrict callbacks ([686c6fe](https://github.com/fritz-c/react-shape-editor/commit/686c6fe))
* switch to svg for performance reasons ([153fbc9](https://github.com/fritz-c/react-shape-editor/commit/153fbc9))


### Performance Improvements

* migrate all mouse event handling to a central parent handler ([d69b06c](https://github.com/fritz-c/react-shape-editor/commit/d69b06c))
* move the drawing logic to different component for perf reasons ([886a094](https://github.com/fritz-c/react-shape-editor/commit/886a094))
