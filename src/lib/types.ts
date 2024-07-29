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

type BoundingBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type PathfindingAlgorithm = "dijkstra" | "a*";

type AnimationSpeed = "slow" | "medium" | "fast";
