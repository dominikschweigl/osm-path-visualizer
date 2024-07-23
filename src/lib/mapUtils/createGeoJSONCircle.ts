import { POLE_RADIUS, EQUATOR_RADIUS } from "../constants";

/**
 *
 * @param center center of circle
 * @param radius radius of circle in km
 * @param points amount of points the circle consists of
 * @returns
 */

export function createGeoJSONCircle(center: GeoLocationPoint | Coordinates, radius: number, points: number = 64): Coordinates[] {
  const phi = center.lat;
  const lambda = center.lon;

  const distanceX = (180 * radius) / (Math.cos((phi * Math.PI) / 180) * EQUATOR_RADIUS * 2 * Math.PI * Math.PI);
  const distanceY = (180 * radius) / (POLE_RADIUS * 2 * Math.PI * Math.PI);

  const circle: Coordinates[] = [];

  let theta, latitude, longitude;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * 360;
    latitude = phi + distanceY * Math.cos((theta * Math.PI) / 180);
    longitude = lambda + distanceX * Math.sin((theta * Math.PI) / 180);
    circle.push({ lat: latitude, lon: longitude });
  }

  return circle;
}
