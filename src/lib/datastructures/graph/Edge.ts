import Node from "./Node";

export default class Edge {
  private start: Node;
  private end: Node;
  private length: number;

  constructor(start: Node, end: Node) {
    this.start = start;
    this.end = end;
    this.length = 0;
  }

  getStart(): Node {
    return this.start;
  }

  getEnd(): Node {
    return this.end;
  }

  getLength(): number {
    return this.length;
  }

  opposite(from: Node): Node {
    return from.getID() === this.start.getID() ? this.end : this.start;
  }
}
