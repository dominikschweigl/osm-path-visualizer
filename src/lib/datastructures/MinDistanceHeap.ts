import Node from "../graph/Node";

export default class MinDistanceHeap {
  private heap: { node: Node; distance: number }[];
  private NodeIndices: Map<Node, number>;
  private start: Node;

  constructor(start: Node, nodes?: Node[]) {
    this.heap = [];
    this.start = start;
    this.NodeIndices = new Map();

    if (nodes) {
      this.heap = nodes.map((node, i) => {
        this.NodeIndices.set(node, i);
        return { node: node, distance: this.getNodeDistance(node) };
      });

      for (let i = this.heap.length - 1; i > 0; i--) {
        const parent = MinDistanceHeap.getParentIndex(i);
        if (this.heap[parent].distance > this.heap[i].distance) this.swap(parent, i);
      }
    }
  }

  private static getParentIndex(childIndex: number): number {
    if (childIndex == 0) return 0;
    return Math.floor((childIndex - 1) / 2);
  }

  private parent(child: number): { node: Node; distance: number } {
    return this.heap[MinDistanceHeap.getParentIndex(child)];
  }

  private static getLeftChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 1;
  }

  private leftChild(parentIndex: number): { node: Node; distance: number } {
    return this.heap[MinDistanceHeap.getLeftChildIndex(parentIndex)];
  }

  private hasLeftChild(parentIndex: number): boolean {
    return MinDistanceHeap.getLeftChildIndex(parentIndex) < this.heap.length;
  }

  private static getRightChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 2;
  }

  private rightChild(parentIndex: number): { node: Node; distance: number } {
    return this.heap[MinDistanceHeap.getRightChildIndex(parentIndex)];
  }

  private hasRightChild(parentIndex: number): boolean {
    return MinDistanceHeap.getRightChildIndex(parentIndex) < this.heap.length;
  }

  private swap(index1: number, index2: number): void {
    const node1 = this.heap[index1].node;
    const node2 = this.heap[index2].node;
    this.NodeIndices.set(node1, index2);
    this.NodeIndices.set(node2, index1);

    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }

  add(node: Node): void {
    this.heap.push({ node: node, distance: this.getNodeDistance(node) });
    this.heapifyUp();
  }

  private heapifyUp(nodeIndex?: number): void {
    let current = nodeIndex || this.heap.length - 1;
    while (current > 0 && this.parent(current).distance > this.heap[current].distance) {
      const parent = MinDistanceHeap.getParentIndex(current);
      this.swap(current, parent);
      current = parent;
    }
  }

  remove(): Node {
    const removed: Node = this.heap[0].node;
    const popped = this.heap.pop();
    if (popped) {
      this.heap[0] = popped;
    } else {
      throw new Error("ERROR: tried to remove from empty Heap!");
    }
    this.heapifyDown();
    return removed;
  }

  private heapifyDown(): void {
    let current = 0;

    while (this.hasLeftChild(current)) {
      let smallerChild = MinDistanceHeap.getLeftChildIndex(current);
      if (this.hasRightChild(current) && this.leftChild(current).distance > this.rightChild(current).distance) {
        smallerChild = MinDistanceHeap.getRightChildIndex(current);
      }
      if (this.heap[current].distance < this.heap[smallerChild].distance) {
        break;
      }
      this.swap(current, smallerChild);
      current = smallerChild;
    }
  }

  adjustDistance(node: Node, distance: number) {
    const nodeIndex = this.NodeIndices.get(node);
    if (!nodeIndex) throw new Error("ERROR: node not inside heap!");

    this.heap[nodeIndex].distance = distance;
    this.heapifyUp(nodeIndex);
  }

  private getNodeDistance(node: Node): number {
    const startLat = this.start.getLatitude();
    const startLon = this.start.getLongitude();

    const nodeLat = node.getLatitude();
    const nodeLon = node.getLongitude();

    const radius = 6371; // km
    const p = Math.PI / 180;

    const a = 0.5 - Math.cos((nodeLat - startLat) * p) / 2 + (Math.cos(startLat * p) * Math.cos(nodeLat * p) * (1 - Math.cos((nodeLon - startLon) * p))) / 2;

    return 2 * radius * Math.asin(Math.sqrt(a));
  }
}
