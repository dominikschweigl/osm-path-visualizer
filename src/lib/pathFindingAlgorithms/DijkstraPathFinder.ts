import Graph from "../graph/Graph";

export default function DijkstraPathFinder(graph: Graph) {
  const source: number = graph.getSource();
  const destination: number = graph.getDestination();
  // const nodes: Map<number, Node> = graph.getNodes();

  const heap = [];

  const current: number = NaN;
  while (current != destination) {}
}
