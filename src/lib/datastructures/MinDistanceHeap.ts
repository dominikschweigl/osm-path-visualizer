import Node from "@/lib/datastructures/graph/Node";
import distanceBetweenNodes from "../mapUtils/distanceBetweenNodes";

export default class MinDistanceHeap {
  private heap: Node[];
  private NodeIndices: Map<number, number>;
  private start: Node;

  constructor(start: Node, nodes?: Node[]) {
    this.heap = [];
    this.start = start;
    this.NodeIndices = new Map();

    if (nodes) {
      this.heap = nodes;

      nodes.forEach((node, i) => {
        this.NodeIndices.set(node.getID(), i);
        node.setDistance(node.getID() === start.getID() ? 0 : Number.MAX_VALUE);
      });

      for (let i = this.heap.length - 1; i > 0; i--) {
        const parent = MinDistanceHeap.getParentIndex(i);
        if (this.heap[parent].getDistance() > this.heap[i].getDistance()) this.swap(parent, i);
      }
    }
  }

  private static getParentIndex(childIndex: number): number {
    if (childIndex == 0) return 0;
    return Math.floor((childIndex - 1) / 2);
  }

  private parent(child: number): Node {
    return this.heap[MinDistanceHeap.getParentIndex(child)];
  }

  private static getLeftChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 1;
  }

  private leftChild(parentIndex: number): Node {
    return this.heap[MinDistanceHeap.getLeftChildIndex(parentIndex)];
  }

  private hasLeftChild(parentIndex: number): boolean {
    return MinDistanceHeap.getLeftChildIndex(parentIndex) < this.heap.length;
  }

  private static getRightChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 2;
  }

  private rightChild(parentIndex: number): Node {
    return this.heap[MinDistanceHeap.getRightChildIndex(parentIndex)];
  }

  private hasRightChild(parentIndex: number): boolean {
    return MinDistanceHeap.getRightChildIndex(parentIndex) < this.heap.length;
  }

  private swap(index1: number, index2: number): void {
    const node1 = this.heap[index1];
    const node2 = this.heap[index2];
    this.NodeIndices.set(node1.getID(), index2);
    this.NodeIndices.set(node2.getID(), index1);

    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }

  //TODO: implement add function
  // add(node: Node): void {
  //   this.heap.push({ node: node, distance: this.getNodeDistance(node) });
  //   this.heapifyUp();
  // }

  private heapifyUp(nodeIndex?: number): void {
    let current = nodeIndex || this.heap.length - 1;
    while (current > 0 && this.parent(current).getDistance() > this.heap[current].getDistance()) {
      const parent = MinDistanceHeap.getParentIndex(current);
      this.swap(current, parent);
      current = parent;
    }
  }

  remove(): Node {
    const popped = this.heap.pop();
    if (!popped) throw new Error("ERROR: tried to remove from empty Heap!");
    if (!this.heap.length) return popped;

    const node = this.heap[0];
    this.NodeIndices.delete(node.getID());

    this.heap[0] = popped;
    this.heapifyDown();

    return node;
  }

  private heapifyDown(): void {
    let current = 0;

    while (this.hasLeftChild(current)) {
      let smallerChild = MinDistanceHeap.getLeftChildIndex(current);
      if (this.hasRightChild(current) && this.leftChild(current).getDistance() > this.rightChild(current).getDistance()) {
        smallerChild = MinDistanceHeap.getRightChildIndex(current);
      }
      if (this.heap[current].getDistance() < this.heap[smallerChild].getDistance()) {
        break;
      }
      this.swap(current, smallerChild);
      current = smallerChild;
    }
  }

  adjustDistance(node: Node, distance: number): void {
    const nodeIndex = this.NodeIndices.get(node.getID());
    if (!nodeIndex) throw new Error(`ERROR: node {${node.getID()}} not inside heap!`);

    this.heap[nodeIndex].setDistance(distance);
    this.heapifyUp(nodeIndex);
  }

  contains(node: Node): boolean {
    return this.NodeIndices.get(node.getID()) !== undefined;
  }

  getLength(): number {
    return this.heap.length;
  }
}
