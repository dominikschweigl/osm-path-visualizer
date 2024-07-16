import Edge from "./Edge";
import Node from "./Node";

export default class Graph {
  private nodes: Map<number, Node>;
  private edges: Edge[];
  private source: number;
  private destination: number;

  constructor(source: number, destination: number, nodes?: GeoLocationPoint[], ways?: GeoLocationWay[]) {
    this.nodes = new Map();
    this.edges = [];
    this.source = source;
    this.destination = destination;

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

          start.addEdge(edge);
          end.addEdge(edge);
        }
      }
    }
  }

  getSource(): number {
    return this.source;
  }

  getDestination(): number {
    return this.destination;
  }

  getNodes(): Map<number, Node> {
    return this.nodes;
  }

  getEdges(): Edge[] {
    return [...this.edges];
  }
}
