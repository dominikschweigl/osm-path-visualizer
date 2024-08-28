import { Dispatch, SetStateAction } from "react";
import Edge from "../datastructures/graph/Edge";

export interface Pathfinder {
  nextSearchStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>, setSearchTile: Dispatch<SetStateAction<BoundingBox | null>>): Promise<boolean>;
  nextTrackBackPathStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean;
  getShortestPath(): Edge[];
  getShortestDistance(): number;
}
