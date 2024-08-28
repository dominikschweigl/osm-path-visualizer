import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import Node from "./Node";

export default class Edge {
  private start: Node;
  private end: Node;

  constructor(start: Node, end: Node) {
    this.start = start;
    this.end = end;
  }

  getStart(): Node {
    return this.start;
  }

  getEnd(): Node {
    return this.end;
  }

  getLength(): number {
    return distanceBetweenNodes(this.start, this.end);
  }

  opposite(from: Node): Node {
    return from.getID() === this.start.getID() ? this.end : this.start;
  }
}
