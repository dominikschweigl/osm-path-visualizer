export async function queryStreets(boundingBox: BoundingBox, signal: AbortSignal | null): Promise<[nodes: GeoLocationPoint[], ways: GeoLocationWay[]]> {
  const streetQuery = `
    [out:json][bbox: ${boundingBox.bottom},${boundingBox.left},${boundingBox.top},${boundingBox.right}];
    (
    way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|residential|unclassified|living_street)$"];
    >;
    );
    out skel qt;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: streetQuery,
    signal: signal,
  });

  if (!res.ok) return Promise.reject();

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

export async function queryNodes(boundingBox: BoundingBox, signal: AbortSignal | null): Promise<GeoLocationPoint[]> {
  const streetQuery = `
    [out:json][bbox: ${boundingBox.bottom},${boundingBox.left},${boundingBox.top},${boundingBox.right}];
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

  for (const element of elements) {
    if (element.type === "node") {
      nodes.push({ type: "node", id: element.id, lat: element.lat, lon: element.lon });
    }
  }

  return nodes;
}

export async function queryNode(nodeID: number): Promise<GeoLocationPoint> {
  const nodeQuery = `
    [out:json][bbox:  47.26, 11.383, 47.278, 11.417];
    node(${nodeID});
    out skel qt;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: nodeQuery,
  });

  const data = await res.json();

  return data.elements[0];
}
