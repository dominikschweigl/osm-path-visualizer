import Edge from "./Edge";
import Node from "./Node";

export default class Graph {
  private nodes: Map<number, Node>;
  private edges: Edge[];
  private sourceID: number;
  private destinationID: number;

  constructor(source: Node, destination: Node, nodes?: GeoLocationPoint[], ways?: GeoLocationWay[]) {
    this.sourceID = source.getID();
    this.destinationID = destination.getID();
    this.edges = [];
    this.nodes = new Map();
    this.nodes.set(this.sourceID, source);
    this.nodes.set(this.destinationID, destination);
    source.setDistance(0);
    source.setVisitTime(0);

    if (nodes && ways) {
      for (const node of nodes) {
        if (this.nodes.has(node.id)) continue;
        this.nodes.set(node.id, new Node(node.id, node.lat, node.lon));
      }
      for (const way of ways) {
        for (let i = 1; i < way.nodes.length; i++) {
          const start = this.nodes.get(way.nodes[i - 1]);
          const end = this.nodes.get(way.nodes[i]);
          if (!start || !end) continue;

          const startEdge: Edge = new Edge(start, end);
          const endEdge: Edge = new Edge(end, start);
          this.edges.push(startEdge);
          this.edges.push(endEdge);

          start.addEdge(end, startEdge);
          end.addEdge(start, endEdge);
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

  getNode(id: number): Node {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Node {${id}} not stored in Graph`);
    return node;
  }

  getEdges(): Edge[] {
    return [...this.edges];
  }
}
