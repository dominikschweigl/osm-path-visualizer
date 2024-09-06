import { Dispatch, SetStateAction } from "react";
import Edge from "../datastructures/graph/Edge";
import { BoundingBox } from "../types";

export interface Pathfinder {
  nextSearchStep(
    setSearchedPaths: Dispatch<SetStateAction<Edge[]>>,
    setSearchTile: Dispatch<SetStateAction<BoundingBox | null>>,
    abortSignal: AbortSignal | null
  ): Promise<boolean>;
  nextTrackBackPathStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean;
  getShortestPath(): Edge[];
  getShortestDistance(): number;
}
