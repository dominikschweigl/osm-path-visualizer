import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bird, Crown, Rabbit, Radius, Turtle } from "lucide-react";
import { AnimationSpeed } from "@/lib/constants";
import { PathfinderState, PathfindingAlgorithm, PathfindingAnimation } from "@/lib/types";
import { Text } from "@/components/ui/typography";

interface SettingsProps {
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
}

export default function Settings({ pathfinder, animation }: SettingsProps) {
  return (
    <fieldset className="grid gap-5 md:gap-4 w-full">
      <Text as={"h5"} element="h3" className="hidden md:block">
        Settings
      </Text>
      <div className="grid gap-3">
        <Label htmlFor="model">Search Algorithm</Label>
        <Select
          value={pathfinder.algorithm}
          onValueChange={(v: PathfindingAlgorithm) => {
            pathfinder.setAlgorithm(v);
            console.log(v);
          }}
        >
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
  );
}
