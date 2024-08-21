import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Graph from "@/lib/datastructures/graph/Graph";
import { Button } from "@/components/ui/button";
import { FastForward, Pause, Play, Rewind, RotateCcw, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PlaybackControlsProps {
  time: number;
  isAnimationPlaying: boolean;
  retractSearchPaths: boolean;
  maxTime: number;
  setRetractSearchPaths: Dispatch<SetStateAction<boolean>>;
  setTime: Dispatch<SetStateAction<number>>;
  play: () => void;
  pause: () => void;
  finish: () => void;
  reset: () => void;
  restart: () => void;
}

export default function PlaybackControls({
  time,
  isAnimationPlaying,
  retractSearchPaths,
  maxTime,
  setRetractSearchPaths,
  setTime,
  play,
  pause,
  finish,
  restart,
  reset,
}: PlaybackControlsProps) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
      <legend className="-ml-1 px-1 text-sm font-medium">Playback</legend>
      <div className="grid gap-3">
        <Label htmlFor="animationTime">Animation Time</Label>
        <Slider id={"animationTime"} max={maxTime} min={0} step={0.01} value={[time]} onValueChange={([time]) => setTime(time)} />
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-6">
        <Button className="gap-1.5 text-sm" type="button" onClick={reset}>
          <Rewind className="size-3.5" />
          Reset
        </Button>
        {isAnimationPlaying ? (
          <Button className="gap-1.5 text-sm" type="button" onClick={pause}>
            <Pause className="size-3.5" />
            Pause
          </Button>
        ) : (
          <Button className="gap-1.5 text-sm" type="button" onClick={play}>
            <Play className="size-3.5" />
            Play
          </Button>
        )}

        <Button className="gap-1.5 text-sm" type="button" onClick={finish}>
          <FastForward className="size-3.5" />
          Finish
        </Button>
        <Button className="gap-1.5 text-sm" type="button" onClick={restart}>
          <RotateCcw className="size-3.5" />
          Restart
        </Button>
        <div className="flex items-center space-x-2 col-span-4">
          <Switch
            id="retract-search-paths"
            onCheckedChange={(v) => {
              setRetractSearchPaths(v);
            }}
            checked={retractSearchPaths}
          />
          <Label htmlFor="retract-search-paths" className="cursor-pointer">
            Retract Search Paths
          </Label>
        </div>
      </div>
    </fieldset>
  );
}
