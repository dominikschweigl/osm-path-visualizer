"use client";

import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/spinner";
import usePathfindingAnimation from "@/hooks/usePathfindingAnimation";
import usePathfinder from "@/hooks/usePathfinder";
import Sidebar from "@/components/layouts/controls/Sidebar";
import { MapLocation } from "@/lib/types";
import useGraph from "@/hooks/useGraph";
import PathfinderMap from "@/components/layouts/PathfinderMap";

const INITIAL_ZOOM = 10;

export default function PathfindingVisualizer() {
  const [viewstate, setViewstate] = useState<MapViewState>({
    longitude: 11.39,
    latitude: 47.27,
    zoom: INITIAL_ZOOM,
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
    transitionDuration: "auto",
    pitch: 0,
  });

  const [start, setStart] = useState<MapLocation | null>(null);
  const [destination, setDestination] = useState<MapLocation | null>(null);

  const graph = useGraph({ start, destination });

  const animation = usePathfindingAnimation({ graph });

  const pathfinder = usePathfinder({
    graph,
    animation: animation.controls,
  });

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0">
        <Sidebar
          start={start}
          destination={destination}
          pathfinder={pathfinder}
          animation={animation}
          setStart={setStart}
          setDestination={setDestination}
          setViewState={setViewstate}
        />
      </div>
      <div className="relative flex min-h-[50vh] flex-col rounded-lg bg-muted/50 p-4 lg:col-span-3 overflow-hidden border mt-[9px] ">
        <Badge variant="outline" className="absolute right-3 top-3 bg-white z-10">
          Output
        </Badge>
        <PathfinderMap
          start={start}
          destination={destination}
          viewstate={viewstate}
          pathfinder={pathfinder}
          animation={animation}
          setStart={setStart}
          setDestination={setDestination}
          setViewstate={setViewstate}
        />
      </div>
    </main>
  );
}
