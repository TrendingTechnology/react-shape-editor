export function getScaledMouseCoordinates(event, scale = 1) {
  const { top, left } = event.target.getBoundingClientRect();
  const domX = event.clientX - left;
  const domY = event.clientY - top;

  return {
    x: domX / scale,
    y: domY / scale,
  };
}
