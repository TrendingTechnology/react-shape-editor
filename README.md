# React Shape Editor

Simple shape editor component

Todo
- Per-child constrictMove functions
- Make dragging still work when mouse exits editor area mid-drag
- Focus on last available node after deleting
- Try reversing bubbling direction for drawing logic
- Grid preview for demo
- Custom handle styles
- Consolidate event handling so it's not one window-bound mousemove handler per shape.
  - Tell parent to initiate drawing mode, pass it a function to hand back the mousemove or mouseup event object
  and the id/whatever of who it will handle
  - parent handles mousemove with single listener
  - listener delegates the handling back to the shape
