import { AnimationSpeed } from "./constants";
import { Dispatch, SetStateAction } from "react";
import Edge from "./datastructures/graph/Edge";

export type GeoLocationPoint = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
};

export type GeoLocationWay = {
  type: "way";
  id: number;
  nodes: number[];
};

export type Coordinates = {
  type: "coordinates";
  lat: number;
  lon: number;
};

export type MapLocation = {
  type: "mapLocation";
  street: string;
  city: string;
  region: string;
  country: string;
  addresstype: string;
  importance: number;
  geoLocation: GeoLocationPoint;
};

export type BoundingBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type PathfindingAlgorithm = "dijkstra" | "a*";

export type AnimationControls = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  restart: () => void;
  finish: () => void;
};

export type PathfindingAnimation = {
  searchLayerTime: number;
  time: number;
  maxTime: number;
  isAnimationPlaying: boolean;
  animationSpeed: AnimationSpeed;
  retractSearchPaths: boolean;
  controls: AnimationControls;
  setTime: Dispatch<SetStateAction<number>>;
  setAnimationSpeed: Dispatch<SetStateAction<AnimationSpeed>>;
  setRetractSearchPaths: Dispatch<SetStateAction<boolean>>;
};

export type PathfinderState = {
  searchPaths: Edge[];
  shortestPath: Edge[];
  searchTile: BoundingBox | null;
  searchLoading: boolean;
  algorithm: PathfindingAlgorithm;
  setAlgorithm: Dispatch<SetStateAction<PathfindingAlgorithm>>;
};
