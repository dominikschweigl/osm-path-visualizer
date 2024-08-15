export default function isWithinBoundingBox(location: GeoLocationPoint | MapLocation, bound: BoundingBox) {
  let point: GeoLocationPoint;
  if (location.type == "mapLocation") {
    point = location.geoLocation;
  } else {
    point = location;
  }

  if (point.lat > 90 || point.lat < -90 || point.lon > 180 || point.lon < -180) {
    console.warn(`Point ${point.id} has Invalid Coordinates`);
  }

  //TODO: Doesn't work on antimeridian yet
  return point.lat <= bound.top && point.lat >= bound.bottom && point.lon <= bound.right && point.lon >= bound.left;
}
