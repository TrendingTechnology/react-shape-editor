export function getPlaneContainer(node) {
  let planeContainer = node;
  while (
    planeContainer &&
    (!planeContainer.dataset || !planeContainer.dataset.isPlaneContainer)
  ) {
    planeContainer = planeContainer.parentNode;
  }

  return planeContainer;
}

export function getRectFromCornerCoordinates(corner1, corner2) {
  return {
    x: Math.min(corner1.x, corner2.x),
    y: Math.min(corner1.y, corner2.y),
    width: Math.abs(corner1.x - corner2.x),
    height: Math.abs(corner1.y - corner2.y),
  };
}
