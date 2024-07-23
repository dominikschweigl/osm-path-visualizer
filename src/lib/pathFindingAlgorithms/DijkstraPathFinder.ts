import MinDistanceHeap from "../datastructures/MinDistanceHeap";
import Graph from "../datastructures/graph/Graph";
import Node from "../datastructures/graph/Node";
import Edge from "../datastructures/graph/Edge";
import distanceBetweenNodes from "../mapUtils/distanceBetweenNodes";
import { SetStateAction, Dispatch } from "react";

export default class DijkstraPathFinder {
  private graph: Graph;
  private heap: MinDistanceHeap;

  private predecessors: Map<number, Node>;
  private searchedPaths: Edge[];

  constructor(graph: Graph) {
    this.graph = graph;
    this.searchedPaths = [];
    this.predecessors = new Map();
    this.heap = new MinDistanceHeap(graph.getSource(), graph.getNodes());
  }

  /**
   *
   * @param setSearchedPaths
   * @returns true if end has been reached
   */
  nextStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean {
    const destination: Node = this.graph.getDestination();

    const nearestNode = this.heap.remove();

    if (nearestNode.getID() !== this.graph.getSource().getID()) {
      this.searchedPaths.push(nearestNode.getEdge(this.predecessors.get(nearestNode.getID())!));
      setSearchedPaths((prev) => [...prev, nearestNode.getEdge(this.predecessors.get(nearestNode.getID())!)]);
    }

    nearestNode.getEdges().forEach((edge) => {
      const neighbor: Node = edge.opposite(nearestNode);

      if (neighbor.getDistance() > nearestNode.getDistance() + distanceBetweenNodes(nearestNode, neighbor)) {
        neighbor.setDistance(nearestNode.getDistance() + distanceBetweenNodes(nearestNode, neighbor));
        this.predecessors.set(neighbor.getID(), nearestNode);

        this.heap.adjustDistance(neighbor, neighbor.getDistance());
      }
    });

    return nearestNode.getID() == destination.getID();
  }

  trackShortestPath() {
    const path: Edge[] = [];

    const current: Node = this.graph.getDestination();
    while (current.getID() !== this.graph.getSource().getID()) {
      const neighbors = current.getEdges().map((e) => e.opposite(current));
      for (const neighbor of neighbors) {
        if (Math.abs(current.getDistance() - neighbor.getDistance()) === distanceBetweenNodes(current, neighbor)) {
          path.push(current.getEdge(neighbor));
          break;
        }
      }
    }

    return path.reverse();
  }
}
