import Node from "../datastructures/graph/Node";

export default function isInsideBoundingBox(node: Node, bound: BoundingBox): boolean {
  return node.getLatitude() < bound.top && node.getLatitude() > bound.bottom && (node.getLongitude() < bound.right || node.getLongitude() > bound.left);
}
