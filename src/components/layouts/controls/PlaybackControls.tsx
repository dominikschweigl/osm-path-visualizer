import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Graph from "@/lib/datastructures/graph/Graph";
import { Button } from "@/components/ui/button";
import { FastForward, Pause, Play, Rewind, RotateCcw, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AnimationControls, PathfindingAnimation } from "@/lib/types";
import { Text } from "@/components/ui/typography";

interface PlaybackControlsProps {
  animation: PathfindingAnimation;
}

export default function PlaybackControls({ animation }: PlaybackControlsProps) {
  const { isAnimationPlaying, time, maxTime, controls, retractSearchPaths, setTime, setRetractSearchPaths } = animation;

  return (
    <fieldset className="grid gap-4 w-full">
      <Text as={"h5"} element="h2" className="hidden md:block">
        Playback
      </Text>
      <div className="grid gap-3">
        <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Animation Time</div>
        <Slider id="animationTime" max={maxTime} min={0} step={0.01} value={[time]} onValueChange={([time]) => setTime(time)} />
      </div>
      <div className="grid mt-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6">
        <Button className="gap-1.5 text-sm" type="button" onClick={controls.reset}>
          <Rewind className="size-3.5" />
          Reset
        </Button>
        {isAnimationPlaying ? (
          <Button className="gap-1.5 text-sm" type="button" onClick={controls.pause}>
            <Pause className="size-3.5" />
            Pause
          </Button>
        ) : (
          <Button className="gap-1.5 text-sm" type="button" onClick={controls.play}>
            <Play className="size-3.5" />
            Play
          </Button>
        )}
        <Button className="gap-1.5 text-sm" type="button" onClick={controls.finish}>
          <FastForward className="size-3.5" />
          Finish
        </Button>
        <Button className="gap-1.5 text-sm hidden sm:flex md:hidden lg:flex" type="button" onClick={controls.restart}>
          <RotateCcw className="size-3.5" />
          Restart
        </Button>
        <div className="flex items-center space-x-2 col-span-3 sm:col-span-4 md:col-span-3 lg:col-span-4">
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
