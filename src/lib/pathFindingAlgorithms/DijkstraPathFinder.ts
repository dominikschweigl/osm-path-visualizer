import NodeHeap from "../datastructures/NodeHeap";
import Graph from "../datastructures/graph/Graph";
import Node from "../datastructures/graph/Node";
import Edge from "../datastructures/graph/Edge";
import distanceBetweenNodes from "../mapUtils/distanceBetweenNodes";
import { SetStateAction, Dispatch } from "react";
import { Pathfinder } from "./interface";
import { createBoundingBox } from "../mapUtils/createBoundingBox";
import { createSearchTile } from "../mapUtils/createSearchTile";
import { queryStreets } from "../mapUtils/overpassQuery";
import { BoundingBox } from "../types";
import { fetchError } from "../constants";

export default class DijkstraPathFinder implements Pathfinder {
  private graph: Graph;
  private heap: NodeHeap;

  private predecessors: Map<number, Node>;
  private searchedPaths: Edge[];

  private currentSearchNode: number;

  private currentShortestPathNode: Node;

  private searchTileSideLength: number;

  constructor(graph: Graph, searchTileSideLength: number) {
    this.graph = graph;
    this.currentShortestPathNode = graph.getDestination();
    this.currentSearchNode = 1;
    this.searchedPaths = [];
    this.predecessors = new Map();
    this.heap = new NodeHeap(graph.getSource(), graph.getNodes());
    this.searchTileSideLength = searchTileSideLength;
  }

  /**
   *
   * @param setSearchedPaths
   * @returns true if end has been reached
   */
  async nextSearchStep(
    setSearchedPaths: Dispatch<SetStateAction<Edge[]>>,
    setSearchTile: Dispatch<SetStateAction<BoundingBox | null>>,
    abortSignal: AbortSignal | null
  ): Promise<boolean> {
    if (abortSignal && abortSignal.aborted) {
      return new Promise((_, reject) => reject(fetchError.ABORT));
    }

    if (this.heap.peek().getDistance() === Number.MAX_VALUE) {
      console.error("no connection to next node");
      setSearchedPaths([...this.searchedPaths]);
      return new Promise<boolean>((resolve) => {
        resolve(true);
      });
    }

    if (!this.heap.peek().getIsInsideSeenArea()) {
      const tile: BoundingBox = createSearchTile(
        createBoundingBox(this.graph.getSource().getGeoLocation(), this.searchTileSideLength),
        this.searchTileSideLength,
        this.heap.peek().getGeoLocation()
      );
      setSearchTile(tile);
      setSearchedPaths([...this.searchedPaths]);

      try {
        const streets = await queryStreets(tile, abortSignal);
        const nodes = this.graph.addWays(...streets, tile);
        for (const node of nodes) {
          this.heap.add(node, node.getDistance());
        }
      } catch {
        return new Promise((_, reject) => reject(fetchError.ABORT));
      }

      return new Promise<boolean>((resolve) => {
        resolve(false);
      });
    }

    const destination: Node = this.graph.getDestination();
    const nearestNode = this.heap.remove();

    if (nearestNode.getID() === destination.getID()) {
      setSearchedPaths([...this.searchedPaths]);
      setSearchTile(null);
      return new Promise<boolean>((resolve) => {
        resolve(true);
      });
    }

    nearestNode.getEdges().forEach((edge) => {
      const neighbor: Node = edge.opposite(nearestNode);
      if (this.predecessors.get(nearestNode.getID())?.getID() === neighbor.getID()) return;

      neighbor.setSearchVisitTime(this.currentSearchNode);
      this.currentSearchNode++;
      this.graph.setCurrentSearchTime(this.currentSearchNode);

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
