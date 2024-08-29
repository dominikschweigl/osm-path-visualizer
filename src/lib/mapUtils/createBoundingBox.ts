import { POLE_RADIUS, EQUATOR_RADIUS } from "../constants";
import { GeoLocationPoint, Coordinates, BoundingBox } from "../types";

/**
 *
 * @param center center of circle
 * @param sideLength radius of circle in km
 * @returns
 */
export function createBoundingBox(center: GeoLocationPoint | Coordinates, sideLength: number): BoundingBox {
  const distanceX = (180 * sideLength) / 2 / (Math.cos((center.lat * Math.PI) / 180) * EQUATOR_RADIUS * Math.PI);
  const distanceY = (180 * sideLength) / 2 / (POLE_RADIUS * Math.PI);

  return {
    top: Math.min(90, center.lat + distanceY),
    bottom: Math.max(-90, center.lat - distanceY),
    left: Math.max(-180, center.lon - distanceX),
    right: Math.min(180, center.lon + distanceX),
  };
}
