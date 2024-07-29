import Edge from "./Edge";

export default class Node {
  public readonly type = "graph-node";
  private id: number;
  private latitude: number;
  private longitude: number;
  private edges: Map<number, Edge>;
  private distance: number;
  private visitTime: number;

  constructor(id: number, latitude: number, longitude: number) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.edges = new Map<number, Edge>();
    this.distance = Number.MAX_VALUE;
    this.visitTime = Number.MAX_VALUE - 100;
  }

  getEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  getEdge(node: Node): Edge {
    const edge = this.edges.get(node.getID());
    if (!edge) throw new Error(`Node{${this.id}} does not connect to Node{${node.getID()}}`);
    return edge;
  }

  addEdge(node: Node, edge: Edge): void {
    this.edges.set(node.getID(), edge);
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  getID(): number {
    return this.id;
  }

  getDistance(): number {
    return this.distance;
  }

  getVisitTime(): number {
    return this.visitTime;
  }

  setDistance(distance: number): void {
    this.distance = distance;
  }

  setVisitTime(time: number): void {
    this.visitTime = time;
  }
}
