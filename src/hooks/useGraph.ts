import { useState, useEffect } from "react";
import { MapLocation } from "@/lib/types";
import { fetchError } from "@/lib/constants";
import Graph from "@/lib/datastructures/graph/Graph";
import Node from "@/lib/datastructures/graph/Node";
import { queryStreets } from "@/lib/mapUtils/overpassQuery";
import { createBoundingBox } from "@/lib/mapUtils/createBoundingBox";

interface UseGraphProps {
  start: MapLocation | null;
  destination: MapLocation | null;
}

export default function useGraph({ start, destination }: UseGraphProps): Graph | null {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    if (!start || !destination) return;
    setGraph(
      new Graph(
        new Node(start.geoLocation.id, start.geoLocation.lat, start.geoLocation.lon),
        new Node(destination.geoLocation.id, destination.geoLocation.lat, destination.geoLocation.lon)
      )
    );
  }, [start, destination]);

  return graph;
}
