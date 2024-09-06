import isWithinBoundingBox from "@/lib/mapUtils/isWithinBoundingBox";
import Edge from "./Edge";
import Node from "./Node";
import { GeoLocationPoint, GeoLocationWay, BoundingBox } from "@/lib/types";

export default class Graph {
  private nodes: Map<number, Node>;
  private edges: Edge[];
  private sourceID: number;
  private destinationID: number;
  private highestSearchVisitTime: number;

  constructor(source: Node, destination: Node, geolocations?: GeoLocationPoint[], ways?: GeoLocationWay[]) {
    this.sourceID = source.getID();
    this.destinationID = destination.getID();
    this.edges = [];
    this.nodes = new Map();
    this.nodes.set(this.sourceID, source);
    this.nodes.set(this.destinationID, destination);
    source.setDistance(0);
    source.setSearchVisitTime(0);
    source.setIsInsideSeenArea(false);
    this.highestSearchVisitTime = 0;

    if (geolocations && ways) {
      this.addWays(geolocations, ways);
    }
  }

  getSource(): Node {
    return this.nodes.get(this.sourceID) as Node;
  }

  getDestination(): Node {
    return this.nodes.get(this.destinationID) as Node;
  }

  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getNode(id: number): Node {
    const node = this.nodes.get(id);
    // if (!node) throw new Error(`Node {${id}} not stored in Graph`);
    return node as Node;
  }

  getEdges(): Edge[] {
    return [...this.edges];
  }

  getCurrentSearchTime(): number {
    return this.highestSearchVisitTime;
  }

  setCurrentSearchTime(searchTime: number): void {
    this.highestSearchVisitTime = searchTime;
  }

  addWays(geolocations: GeoLocationPoint[], ways: GeoLocationWay[], bound?: BoundingBox): Node[] {
    const nodes: Node[] = [];

    for (const geolocation of geolocations) {
      let node = this.nodes.get(geolocation.id);
      if (!node) {
        node = new Node(geolocation.id, geolocation.lat, geolocation.lon);
        this.nodes.set(geolocation.id, node);
        nodes.push(node);
      }
      if (bound) {
        node.setIsInsideSeenArea(node.getIsInsideSeenArea() || isWithinBoundingBox(node.getGeoLocation(), bound));
      }
    }

    for (const way of ways) {
      for (let i = 1; i < way.nodes.length; i++) {
        const start = this.nodes.get(way.nodes[i - 1]);
        const end = this.nodes.get(way.nodes[i]);

        if (!start || !end || start.hasConnection(end)) continue;

        const startEdge: Edge = new Edge(start, end);
        const endEdge: Edge = new Edge(end, start);
        this.edges.push(startEdge);
        this.edges.push(endEdge);

        start.addEdge(startEdge);
        end.addEdge(endEdge);
      }
    }

    return nodes;
  }
}
