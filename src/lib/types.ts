interface GeoLocationPoint {
  type: "node";
  id: number;
  lat: number;
  lon: number;
}

interface GeoLocationWay {
  type: "way";
  id: number;
  nodes: number[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}
