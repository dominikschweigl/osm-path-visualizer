import Edge from "./Edge";
import Node from "./Node";

export default class Graph {
  private nodes: Map<number, Node>;
  private edges: Edge[];
  private sourceID: number;
  private destinationID: number;

  constructor(source: number, destination: number, nodes?: GeoLocationPoint[], ways?: GeoLocationWay[]) {
    this.nodes = new Map();
    this.edges = [];
    this.sourceID = source;
    this.destinationID = destination;

    if (nodes && ways) {
      for (const node of nodes) {
        this.nodes.set(node.id, new Node(node.id, node.lat, node.lon));
      }
      for (const way of ways) {
        for (let i = 1; i < way.nodes.length; i++) {
          const start = this.nodes.get(way.nodes[i - 1]);
          const end = this.nodes.get(way.nodes[i]);
          if (!start || !end) continue;

          const edge: Edge = new Edge(start, end);
          this.edges.push(edge);

          start.addEdge(end, edge);
          end.addEdge(start, edge);
        }
      }
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

  getEdges(): Edge[] {
    return [...this.edges];
  }
}
