export default function getNearestNode(point: Coordinates): GeoLocationPoint | null {
  return null;
}

export function createGeoJSONCircle(center: Coordinates, radius: number, points: number = 64): Coordinates[] {
  const phi = center.latitude;
  const lambda = center.longitude;

  const distanceX = radius / (111.32 * Math.cos((phi * Math.PI) / 180));
  const distanceY = radius / 110.574;

  const circle: Coordinates[] = [];

  let theta, latitude, longitude;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * 360;
    latitude = phi + distanceX * Math.cos((theta * Math.PI) / 180);
    longitude = lambda + distanceY * Math.sin((theta * Math.PI) / 180);
    circle.push({ latitude: latitude, longitude: longitude });
  }

  return circle;
}
