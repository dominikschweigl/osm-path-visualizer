import Edge from "./Edge";

export default class Node {
  private id: number;
  private latitude: number;
  private longitude: number;
  private edges: Edge[];

  constructor(id: number, latitude: number, longitude: number) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.edges = [];
  }

  getEdges(): Edge[] {
    return this.edges;
  }

  addEdge(edge: Edge): void {
    this.edges.push(edge);
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }
}
