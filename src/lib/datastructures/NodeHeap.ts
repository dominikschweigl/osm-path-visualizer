import Node from "@/lib/datastructures/graph/Node";
import distanceBetweenNodes from "../mapUtils/distanceBetweenNodes";

export default class NodeHeap {
  private heap: { node: Node; key: number }[];
  private NodeIndices: Map<number, number>;
  private start: Node;

  constructor(start: Node, nodes?: Node[]) {
    this.heap = [];
    this.start = start;
    this.NodeIndices = new Map();

    if (nodes) {
      nodes.forEach((node, i) => {
        this.NodeIndices.set(node.getID(), i);
        node.setDistance(node.getID() === start.getID() ? 0 : Number.MAX_VALUE);
      });

      this.heap = nodes.map((node) => ({ node: node, key: node.getDistance() }));

      for (let i = this.heap.length - 1; i > 0; i--) {
        const parent = NodeHeap.getParentIndex(i);
        if (this.heap[parent].key > this.heap[i].key) this.swap(parent, i);
      }
    }
  }

  private static getParentIndex(childIndex: number): number {
    if (childIndex == 0) return 0;
    return Math.floor((childIndex - 1) / 2);
  }

  private parent(child: number): Node {
    return this.heap[NodeHeap.getParentIndex(child)].node;
  }

  private static getLeftChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 1;
  }

  private leftChild(parentIndex: number): { node: Node; key: number } {
    return this.heap[NodeHeap.getLeftChildIndex(parentIndex)];
  }

  private hasLeftChild(parentIndex: number): boolean {
    return NodeHeap.getLeftChildIndex(parentIndex) < this.heap.length;
  }

  private static getRightChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 2;
  }

  private rightChild(parentIndex: number): { node: Node; key: number } {
    return this.heap[NodeHeap.getRightChildIndex(parentIndex)];
  }

  private hasRightChild(parentIndex: number): boolean {
    return NodeHeap.getRightChildIndex(parentIndex) < this.heap.length;
  }

  private swap(index1: number, index2: number): void {
    const node1 = this.heap[index1];
    const node2 = this.heap[index2];
    this.NodeIndices.set(node1.node.getID(), index2);
    this.NodeIndices.set(node2.node.getID(), index1);

    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }

  add(node: Node, key: number): void {
    this.heap.push({ node: node, key: key });
    this.NodeIndices.set(node.getID(), this.heap.length - 1);
    this.heapifyUp();
  }

  private heapifyUp(nodeIndex?: number): void {
    let current = nodeIndex || this.heap.length - 1;
    while (current > 0 && this.heap[NodeHeap.getParentIndex(current)].key > this.heap[current].key) {
      const parent = NodeHeap.getParentIndex(current);
      this.swap(current, parent);
      current = parent;
    }
  }

  remove(): Node {
    const popped = this.heap.pop();
    if (!popped) throw new Error("ERROR: tried to remove from empty Heap!");
    if (!this.heap.length) return popped.node;

    const node = this.heap[0].node;
    this.NodeIndices.delete(node.getID());

    this.heap[0] = popped;
    this.heapifyDown();

    return node;
  }

  peek(): Node {
    return this.heap[0].node;
  }

  private heapifyDown(): void {
    let current = 0;

    while (this.hasLeftChild(current)) {
      let smallerChild = NodeHeap.getLeftChildIndex(current);
      if (this.hasRightChild(current) && this.leftChild(current).key > this.rightChild(current).key) {
        smallerChild = NodeHeap.getRightChildIndex(current);
      }
      if (this.heap[current].key < this.heap[smallerChild].key) {
        break;
      }
      this.swap(current, smallerChild);
      current = smallerChild;
    }
  }

  adjustDistance(node: Node, distance: number): void {
    const nodeIndex = this.NodeIndices.get(node.getID());
    if (!nodeIndex) {
      // console.warn("Node not found in heap");
      return;
    }

    this.heap[nodeIndex].key = distance;
    this.heapifyUp(nodeIndex);
  }

  contains(node: Node): boolean {
    return this.NodeIndices.get(node.getID()) !== undefined;
  }

  getLength(): number {
    return this.heap.length;
  }
}
