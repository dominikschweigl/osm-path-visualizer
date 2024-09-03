"use client";

import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import usePathfindingAnimation from "@/hooks/usePathfindingAnimation";
import usePathfinder from "@/hooks/usePathfinder";
import Sidebar from "@/components/layouts/controls/Sidebar";
import { MapLocation } from "@/lib/types";
import useGraph from "@/hooks/useGraph";
import PathfinderMap from "@/components/layouts/PathfinderMap";
import SettingsDrawer from "@/components/layouts/controls/SettingsDrawer";
import LocationsInput from "@/components/layouts/controls/LocationsInput";

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
    <main className="grid flex-1 gap-6 overflow-auto md:px-6 md:pb-6 md:grid-cols-3 xl:grid-cols-4">
      <div className="md:hidden absolute top-16 w-full z-50 bg-white rounded-b-[10px] border-b px-4 pb-3 shadow-sm">
        <LocationsInput start={start} destination={destination} setStart={setStart} setDestination={setDestination} setViewState={setViewstate} />
      </div>
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
      <div className="relative flex min-h-[50vh] flex-col border border-gray-100 md:rounded-3xl bg-white p-4 md:col-span-2 xl:col-span-3 overflow-hidden">
        <Badge variant="outline" className="hidden md:block absolute right-3 top-3 bg-white z-10">
          Output
        </Badge>
        <SettingsDrawer
          start={start}
          destination={destination}
          pathfinder={pathfinder}
          animation={animation}
          setStart={setStart}
          setDestination={setDestination}
          setViewstate={setViewstate}
        />
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
