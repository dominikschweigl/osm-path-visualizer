import { useEffect, useRef, useState } from "react";
import Graph from "@/lib/datastructures/graph/Graph";
import Edge from "@/lib/datastructures/graph/Edge";
import DijkstraPathFinder from "@/lib/pathFindingAlgorithms/DijkstraPathFinder";
import { fetchError } from "@/lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import { Pathfinder } from "@/lib/pathFindingAlgorithms/interface";
import AStarPathfinder from "@/lib/pathFindingAlgorithms/AStarPathFinder";
import { PathfindingAlgorithm, PathfinderState, BoundingBox, AnimationControls } from "@/lib/types";

interface UsePathfinderProps {
  graph: Graph | null;
  animation: AnimationControls;
}

export default function usePathfinder({ graph, animation }: UsePathfinderProps): PathfinderState {
  const [algorithm, setAlgorithm] = useState<PathfindingAlgorithm>("a*");

  const [searchPaths, setSearchPaths] = useState<Edge[]>([]);
  const [shortestPath, setShortestPath] = useState<Edge[]>([]);
  const [searchTile, setSearchTile] = useState<BoundingBox | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [previousAbortController, setPreviousAbortController] = useState<AbortController>(new AbortController());

  useEffect(() => {
    setSearchPaths([]);
    setShortestPath([]);
    animation.reset();
    previousAbortController.abort();
    const controller = new AbortController();
    setPreviousAbortController(controller);

    if (!graph) return;

    setSearchLoading(true);

    const searchTileSize = Math.min(40, distanceBetweenNodes(graph.getSource().getGeoLocation(), graph.getDestination().getGeoLocation()) / 4);
    const pathfinder: Pathfinder = algorithm === "a*" ? new AStarPathfinder(graph, searchTileSize) : new DijkstraPathFinder(graph, searchTileSize);

    (async () => {
      animation.play();

      let found = false;
      while (!found) {
        try {
          found = await pathfinder.nextSearchStep(setSearchPaths, setSearchTile, controller.signal);
        } catch {
          found = true;
          setSearchPaths([]);
        }
      }
      setShortestPath(pathfinder.getShortestPath());
      setSearchLoading(false);
    })();

    return () => {
      setSearchLoading(false);
      controller.abort(fetchError.ABORT);
    };
  }, [graph, algorithm]);

  return {
    searchPaths: searchPaths,
    shortestPath: shortestPath,
    searchTile: searchTile,
    searchLoading: searchLoading,
    algorithm: algorithm,
    setAlgorithm: setAlgorithm,
  };
}
