export default function getBoundingBoxFromPolygon(polygon: Coordinates[]) {
  const boundingBox: BoundingBox = {
    top: Number.MIN_VALUE,
    bottom: Number.MAX_VALUE,
    left: Number.MAX_VALUE,
    right: Number.MIN_VALUE,
  };

  for (const point of polygon) {
    boundingBox.top = Math.max(boundingBox.top, point.lat);
    boundingBox.bottom = Math.min(boundingBox.bottom, point.lat);
    boundingBox.left = Math.min(boundingBox.left, point.lon);
    boundingBox.right = Math.max(boundingBox.right, point.lon);
  }

  return boundingBox;
}
