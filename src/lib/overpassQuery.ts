import Node from "./graph/Node";

export async function queryStreets(boundingBox: [Coordinates, Coordinates]): Promise<[nodes: GeoLocationPoint[], ways: GeoLocationWay[]]> {
  const streetQuery = `
    [out:json][bbox: ${boundingBox[0].latitude},${boundingBox[0].longitude},${boundingBox[1].latitude},${boundingBox[1].longitude}];
    (
    way["highway"~"^(trunk|primary|secondary|tertiary|unclassified|residential)$"];
    >;
    );
    out skel;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: streetQuery,
  });
  const data = await res.json();
  const elements: (GeoLocationPoint | GeoLocationWay)[] = data.elements;

  const nodes: GeoLocationPoint[] = [];
  const ways: GeoLocationWay[] = [];

  for (const element of elements) {
    if (element.type === "node") {
      nodes.push({ type: "node", id: element.id, lat: element.lat, lon: element.lon });
    }
    if (element.type === "way") {
      ways.push({ type: "way", id: element.id, nodes: element.nodes });
    }
  }

  return [nodes, ways];
}
