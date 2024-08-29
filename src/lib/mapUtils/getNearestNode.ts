import { createGeoJSONCircle } from "./createGeoJSONCircle";
import getBoundingBoxFromPolygon from "./getBoundingBoxFromPolygon";
import { queryNodes } from "./overpassQuery";
import distanceBetweenNodes from "./distanceBetweenNodes";
import { fetchError } from "../constants";
import { Coordinates, GeoLocationPoint } from "../types";

const SEARCH_RADIUS: number = 2; //in km

export default async function getNearestNode(point: Coordinates, signal: AbortSignal | null): Promise<GeoLocationPoint> {
  const boundingBox = getBoundingBoxFromPolygon(createGeoJSONCircle(point, SEARCH_RADIUS));
  const controller = new AbortController();

  const nodes = await queryNodes(boundingBox, signal || controller.signal);

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
