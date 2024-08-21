import Edge from "./Edge";

export default class Node {
  public readonly type = "graph-node";
  private id: number;
  private latitude: number;
  private longitude: number;
  private edges: Map<number, Edge>;
  private distance: number;
  private searchVisitTime: number;
  private trackBackVisitTime: number;

  constructor(id: number, latitude: number, longitude: number) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.edges = new Map<number, Edge>();
    this.distance = Number.MAX_VALUE;
    this.searchVisitTime = Number.MAX_VALUE;
    this.trackBackVisitTime = Number.MAX_VALUE;
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

  getSearchVisitTime(): number {
    return this.searchVisitTime;
  }

  getTrackBackVisitTime(): number {
    return this.trackBackVisitTime;
  }

  setDistance(distance: number): void {
    this.distance = distance;
  }

  setSearchVisitTime(time: number): void {
    this.searchVisitTime = time;
  }

  setTrackBackVisitTime(time: number): void {
    this.trackBackVisitTime = time;
  }
}
