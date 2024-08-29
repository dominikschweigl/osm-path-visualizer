import LocationsInput from "@/components/layouts/controls/LocationsInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bird, Crown, Rabbit, Radius, Turtle } from "lucide-react";
import { AnimationSpeed } from "@/lib/constants";
import PlaybackControls from "@/components/layouts/controls/PlaybackControls";
import { Dispatch, SetStateAction } from "react";
import { MapViewState } from "@deck.gl/core";
import { MapLocation, PathfinderState, PathfindingAlgorithm, PathfindingAnimation } from "@/lib/types";

interface SidebarProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
}

export default function Sidebar({ start, destination, pathfinder, animation, setStart, setDestination, setViewState }: SidebarProps) {
  return (
    <form className="grid w-full items-start gap-6">
      <LocationsInput start={start} destination={destination} setStart={setStart} setDestination={setDestination} setViewState={setViewState} />
      <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
        <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
        <div className="grid gap-3">
          <Label htmlFor="model">Search Algorithm</Label>
          <Select value={pathfinder.algorithm} onValueChange={(v: PathfindingAlgorithm) => pathfinder.setAlgorithm(v)}>
            <SelectTrigger id="model" className="items-start [&_[data-description]]:hidden">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a*">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Crown className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      <span className="font-medium text-foreground">A*</span> Algorithm
                    </p>
                    <p className="text-xs" data-description>
                      The optimal Algorithm to find the shortest path
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="dijkstra">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Radius className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      <span className="font-medium text-foreground">Djisktra&apos;s</span> Algorithm
                    </p>
                    <p className="text-xs" data-description>
                      The general method to find shortest paths
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="animationSpeed">Animation Speed</Label>
          <Select
            value={animation.animationSpeed.toString()}
            onValueChange={(s) => {
              animation.setAnimationSpeed(+s);
            }}
          >
            <SelectTrigger id="animationSpeed" className="items-start [&_[data-description]]:hidden">
              <SelectValue placeholder="Select an animation speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AnimationSpeed.Fast.toString()}>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Rabbit className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      <span className="font-medium text-foreground">Fast</span> Simulation
                    </p>
                    <p className="text-xs" data-description>
                      Well suited for large distances
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={AnimationSpeed.Medium.toString()}>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Bird className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      <span className="font-medium text-foreground">Medium</span> Simulation
                    </p>
                    <p className="text-xs" data-description>
                      Works best for medium distances
                    </p>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={AnimationSpeed.Slow.toString()}>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Turtle className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      <span className="font-medium text-foreground">Slow</span> Simulation
                    </p>
                    <p className="text-xs" data-description>
                      Great for analyzing the search algorithm
                    </p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </fieldset>
      <PlaybackControls
        time={animation.time}
        maxTime={animation.maxTime}
        isAnimationPlaying={animation.isAnimationPlaying}
        retractSearchPaths={animation.retractSearchPaths}
        setRetractSearchPaths={animation.setRetractSearchPaths}
        setTime={animation.setTime}
        controls={animation.controls}
      />
    </form>
  );
}
