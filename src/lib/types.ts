type GeoLocationPoint = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

type GeoLocationWay = {
  type: "way";
  id: number;
  nodes: number[];
};

type Coordinates = {
  type: "coordinates";
  lat: number;
  lon: number;
};

type MapLocation = {
  street: string;
  city: string;
  region: string;
  country: string;
  addresstype: string;
  importance: number;
  geoLocation: GeoLocationPoint;
};

type BoundingBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type PathfindingAlgorithm = "dijkstra" | "a*";

type AnimationSpeed = "slow" | "medium" | "fast";
