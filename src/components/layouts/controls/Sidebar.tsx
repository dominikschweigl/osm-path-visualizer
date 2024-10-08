import LocationsInput from "@/components/layouts/controls/LocationsInput";
import PlaybackControls from "@/components/layouts/controls/PlaybackControls";
import { Dispatch, SetStateAction } from "react";
import { MapViewState } from "@deck.gl/core";
import { MapLocation, PathfinderState, PathfindingAnimation } from "@/lib/types";
import Settings from "./Settings";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ start, destination, pathfinder, animation, setStart, setDestination, setViewState, setLoading }: SidebarProps) {
  return (
    <form className="flex flex-col w-full h-full max-h-[760px] items-start gap-6 py-6">
      <LocationsInput start={start} destination={destination} setStart={setStart} setDestination={setDestination} setViewState={setViewState} setLoading={setLoading} />
      <Separator className="my-auto h-px" />
      <Settings animation={animation} pathfinder={pathfinder} />
      <Separator className="my-auto h-px" />
      <PlaybackControls animation={animation} />
    </form>
  );
}
