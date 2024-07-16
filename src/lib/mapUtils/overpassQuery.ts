export async function queryStreets(boundingBox: [GeoLocationPoint, GeoLocationPoint], signal: AbortSignal): Promise<[nodes: GeoLocationPoint[], ways: GeoLocationWay[]]> {
  const streetQuery = `
    [out:json][bbox: ${boundingBox[0].lat},${boundingBox[0].lon},${boundingBox[1].lat},${boundingBox[1].lon}];
    (
    way["highway"~"^(trunk|primary|secondary|tertiary|residential|unclassified)$"];
    >;
    );
    out skel qt;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: streetQuery,
    signal: signal,
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
