interface GeoLocationPoint {
  type: "node";
  id: number;
  lat: number;
  lon: number;
}

type GeoLocationWay = {
  type: "way";
  id: number;
  nodes: number[];
};

interface Coordinates {
  type: "coordinates";
  lat: number;
  lon: number;
}

interface BoundingBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
