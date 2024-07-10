import Node from "./Node";

export default class Edge {
  private start: Node;
  private end: Node;

  constructor(start: Node, end: Node) {
    this.start = start;
    this.end = end;
  }
}
