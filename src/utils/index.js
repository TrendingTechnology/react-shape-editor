export function getScaledMouseCoordinates(event, scale = 1) {
  const { top, left } = event.target.getBoundingClientRect();
  const domX = event.clientX - left;
  const domY = event.clientY - top;

  return {
    x: domX / scale,
    y: domY / scale,
  };
}

export function getRectFromCornerCoordinates(corner1, corner2) {
  return {
    x: Math.min(corner1.x, corner2.x),
    y: Math.min(corner1.y, corner2.y),
    width: Math.abs(corner1.x - corner2.x),
    height: Math.abs(corner1.y - corner2.y),
  };
}
