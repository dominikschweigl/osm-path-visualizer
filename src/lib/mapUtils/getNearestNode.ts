import { createGeoJSONCircle } from "./createGeoJSONCircle";
import getBoundingBoxFromPolygon from "./getBoundingBoxFromPolygon";
import { queryNodes } from "./overpassQuery";
import { degreesToRads } from "./degreesToRads";
import distanceBetweenNodes from "./distanceBetweenNodes";
import { fetchError } from "../errors";

const SEARCH_RADIUS = 1; //in km

export default async function getNearestNode(point: Coordinates, signal: AbortSignal): Promise<GeoLocationPoint> {
  const boundingBox = getBoundingBoxFromPolygon(createGeoJSONCircle(point, SEARCH_RADIUS));

  const nodes = await queryNodes(boundingBox, signal);

  if (!nodes.length) {
    return Promise.reject(fetchError.NO_NODE_IN_PROXIMITY);
  }

  let minDistance = Number.MAX_VALUE;
  let minDistanceNode = nodes[0];
  for (const node of nodes) {
    const distance = distanceBetweenNodes(point, node);
    if (distance < minDistance) {
      minDistance = distance;
      minDistanceNode = node;
    }
  }

  return minDistanceNode;
}
