import { MEDIAN_EARTH_RADIUS } from "../constants";
import { degreesToRads } from "./degreesToRads";
import Node from "@/lib/datastructures/graph/Node";
import { GeoLocationPoint, Coordinates } from "../types";

export default function distanceBetweenNodes(start: GeoLocationPoint | Coordinates | Node, destination: GeoLocationPoint | Coordinates | Node): number {
  const { cos, sin, atan2, sqrt, abs } = Math;

  const phi1 = degreesToRads(start.type === "graph-node" ? start.getLatitude() : start.lat);
  const phi2 = degreesToRads(destination.type === "graph-node" ? destination.getLatitude() : destination.lat);
  const lambda1 = degreesToRads(start.type === "graph-node" ? start.getLongitude() : start.lon);
  const lambda2 = degreesToRads(destination.type === "graph-node" ? destination.getLongitude() : destination.lon);
  const deltaLambda = abs(lambda1 - lambda2);

  //Vincenty formula
  //https://en.wikipedia.org/wiki/Great-circle_distance#Computational_formulae
  const root = sqrt((cos(phi2) * sin(deltaLambda)) ** 2 + (cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(deltaLambda)) ** 2);
  const arc = sin(phi1) * sin(phi2) + cos(phi1) * cos(phi2) * cos(deltaLambda);
  const centralAngle = atan2(root, arc);

  return centralAngle * MEDIAN_EARTH_RADIUS;
}
