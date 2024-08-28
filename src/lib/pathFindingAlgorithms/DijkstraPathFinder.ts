import NodeHeap from "../datastructures/NodeHeap";
import Graph from "../datastructures/graph/Graph";
import Node from "../datastructures/graph/Node";
import Edge from "../datastructures/graph/Edge";
import distanceBetweenNodes from "../mapUtils/distanceBetweenNodes";
import { SetStateAction, Dispatch } from "react";
import { Pathfinder } from "./interface";

export default class DijkstraPathFinder implements Pathfinder {
  private graph: Graph;
  private heap: NodeHeap;

  private predecessors: Map<number, Node>;
  private searchedPaths: Edge[];

  private currentSearchNode: number;

  private currentShortestPathNode: Node;

  constructor(graph: Graph) {
    this.graph = graph;
    this.currentShortestPathNode = graph.getDestination();
    this.currentSearchNode = 1;
    this.searchedPaths = [];
    this.predecessors = new Map();
    this.heap = new NodeHeap(graph.getSource(), graph.getNodes());
  }

  /**
   *
   * @param setSearchedPaths
   * @returns true if end has been reached
   */
  nextSearchStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean {
    if (this.heap.peek().getDistance() === Number.MAX_VALUE) {
      console.error("no connection to next node");
      return true;
    }

    const destination: Node = this.graph.getDestination();
    const nearestNode = this.heap.remove();

    if (nearestNode.getID() === destination.getID()) {
      setSearchedPaths(this.searchedPaths);
      return true;
    }

    nearestNode.getEdges().forEach((edge) => {
      const neighbor: Node = edge.opposite(nearestNode);
      if (this.predecessors.get(nearestNode.getID())?.getID() === neighbor.getID()) return;

      neighbor.setSearchVisitTime(this.currentSearchNode);
      this.currentSearchNode++;

      this.searchedPaths.push(edge);
      // setSearchedPaths((prev) => [...prev, edge]);

      if (neighbor.getDistance() > nearestNode.getDistance() + distanceBetweenNodes(nearestNode, neighbor)) {
        neighbor.setDistance(nearestNode.getDistance() + distanceBetweenNodes(nearestNode, neighbor));

        this.predecessors.set(neighbor.getID(), nearestNode);

        this.heap.adjustDistance(neighbor, neighbor.getDistance());
      }
    });

    return false;
  }

  nextTrackBackPathStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean {
    if (this.currentShortestPathNode.getID() === this.graph.getSource().getID()) return true;

    const predecessor = this.predecessors.get(this.currentShortestPathNode.getID()) as Node;

    const temp = this.currentShortestPathNode; //Do not delete: needed because of state update behaviour of React
    setSearchedPaths((prev) => [...prev, temp.getEdge(predecessor)]);
    this.currentShortestPathNode = predecessor;

    return false;
  }

  getShortestPath(): Edge[] {
    if (!this.predecessors.get(this.graph.getDestination().getID())) console.error("cannot return shortest path before finding destination");

    const path = [];
    let current = this.currentShortestPathNode;
    let time = this.currentSearchNode;
    current.setTrackBackVisitTime(time);
    time++;

    while (current !== this.graph.getSource()) {
      const predecessor = this.predecessors.get(current.getID());
      if (!predecessor) break;

      path.push(current.getEdge(predecessor));
      current = predecessor;
      current.setTrackBackVisitTime(time);
      time++;
    }

    return path;
  }

  getShortestDistance(): number {
    const shortestPath = this.getShortestPath();
    return shortestPath.map((e) => e.getLength()).reduce((a, b) => a + b);
  }
}
