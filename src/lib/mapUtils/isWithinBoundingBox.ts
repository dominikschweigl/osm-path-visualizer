import { GeoLocationPoint, BoundingBox } from "../types";

export default function isWithinBoundingBox(location: GeoLocationPoint, bound: BoundingBox) {
  let point = location;

  if (point.lat > 90 || point.lat < -90 || point.lon > 180 || point.lon < -180) {
    console.warn(`Point ${point.id} has Invalid Coordinates`);
  }

  const isWithinLatitude = bound.bottom <= point.lat && point.lat <= bound.top;

  let isWithinLongitude: boolean;
  if (bound.left < bound.right) {
    isWithinLongitude = bound.left <= point.lon && point.lon <= bound.right;
  } else {
    isWithinLongitude = bound.left <= point.lon || point.lon <= bound.right;
  }

  return isWithinLatitude && isWithinLongitude;
}
