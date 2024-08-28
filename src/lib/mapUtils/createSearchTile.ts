import { POLE_RADIUS, EQUATOR_RADIUS } from "../constants";

/**
 *
 * @param origin The origin Tile of the rasterized map
 * @param sideLength side length of origin tile
 * @param point any Geolocation Point for which you want the search tile
 * @returns
 */
export function createSearchTile(origin: BoundingBox, sideLength: number, point: GeoLocationPoint): BoundingBox {
  const originCenter: Coordinates = {
    type: "coordinates",
    lat: (origin.top + origin.bottom) / 2,
    lon: (origin.left + origin.right) / 2,
  };

  const sideLengthX = (180 * sideLength) / (Math.cos((originCenter.lat * Math.PI) / 180) * EQUATOR_RADIUS * Math.PI);
  const sideLengthY = (180 * sideLength) / (POLE_RADIUS * Math.PI);

  const nthTileXDirection = Math.round((point.lon - originCenter.lon) / sideLengthX);
  const nthTileYDirection = Math.round((point.lat - originCenter.lat) / sideLengthY);
  //   console.log((point.lon - originCenter.lon) / sideLengthX);
  //   console.log(nthTileXDirection, nthTileYDirection);

  return {
    top: Math.min(90, origin.top + sideLengthY * nthTileYDirection),
    bottom: Math.max(-90, origin.bottom + sideLengthY * nthTileYDirection),
    left: Math.max(-180, origin.left + sideLengthX * nthTileXDirection),
    right: Math.min(180, origin.right + sideLengthX * nthTileXDirection),
  };
}
