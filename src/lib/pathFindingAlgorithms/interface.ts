import { Dispatch, SetStateAction } from "react";
import Edge from "../datastructures/graph/Edge";

export interface Pathfinder {
  nextSearchStep(searchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean;
  nextTrackBackPathStep(setSearchedPaths: Dispatch<SetStateAction<Edge[]>>): boolean;
  getShortestPath(): Edge[];
  getShortestDistance(): number;
}
