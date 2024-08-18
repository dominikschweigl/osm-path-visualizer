"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Clapperboard, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Text } from "../ui/typography";

const VALUES = ["map", "playback", "settings"];

export default function TutorialDialog() {
  const [value, setValue] = useState("map");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const returningUser = localStorage.getItem("seenPopUpPathfinder");
    setOpen(!returningUser);
  }, []);

  const close = (open: boolean) => {
    setOpen(open);
    if (!open) {
      localStorage.setItem("seenPopUpPathfinder", "true");
      setTimeout(() => setValue(VALUES[0]), 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5 text-sm">
          <Play className="size-3.5" />
          Tutorial
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[90%] flex flex-col ">
        <DialogHeader>
          <DialogTitle>OSM Pathfinder Tutorial</DialogTitle>
          {/* <DialogDescription>It's really quick and easy, dont worry.</DialogDescription> */}
        </DialogHeader>

        <Tabs value={value} onValueChange={setValue} className="py-1">
          <TabsList className="w-full flex">
            <TabsTrigger value="map" className="w-full">
              1. Map
            </TabsTrigger>
            <TabsTrigger value="playback" className="w-full">
              2. Playback
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-full">
              3. Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="mt-6 px-10">
            <video className="w-full aspect-video rounded-xl border p-px" autoPlay loop muted>
              <source src="/osm-path-visualizer/tutorial/map.mp4" type="video/mp4" />
            </video>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Map Controls
            </Text>
            <Text element="p" as={"p"} className="mt-2">
              The Map can be navigated by holding the left mouse button and dragging in the desired direction. By Left Click Drag you can rotate and skew the map to your desire.
              Map Zoom is controlled by the scroll wheel.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li>Left Click: Place start position</li>
              <li>Right Click: Place destination position (must be placed within the shown radius)</li>
            </Text>
          </TabsContent>
          <TabsContent value="playback" className="mt-6 px-10">
            <video className="w-full aspect-video rounded-xl border p-px" autoPlay loop muted>
              <source src="/osm-path-visualizer/tutorial/playback.mp4" type="video/mp4" />
            </video>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Playback Controls
            </Text>
            <Text element="p" as={"p"} className="mt-2">
              To start the visualization, press the Start Button. A playback feature is available after the algorithm ends. You can rewatch the algorithm from any point in time or
              clear the path by dragging the animation slider to the desired position.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li>Animation Time: Drag the handle see specific time frames</li>
            </Text>
          </TabsContent>
          <TabsContent value="settings" className="mt-6 px-10">
            <video className="w-full aspect-video rounded-xl border p-px" autoPlay loop muted>
              <source src="/osm-path-visualizer/tutorial/settings.mp4" type="video/mp4" />
            </video>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Settings
            </Text>
            <Text element="p" as={"p"} className="mt-2">
              You can customize the settings of the animation in the Settings Sidebar. With Increasing area radius the calculation may take a while depending on your device and
              internet connection.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li>Animation Speed: Changes how fast the animation will play</li>
              <li>Search Algorithm: Selects the used algorithm (some are only suited for short distances)</li>
              <li>Search Radius: Confines the search space (large radii may cause performance issues)</li>
            </Text>
          </TabsContent>
        </Tabs>

        <DialogFooter className="w-full flex flex-row justify-between items-end flex-1 flex-nowrap">
          <Button
            variant={"ghost"}
            disabled={value == VALUES[0]}
            className="px-3"
            onClick={() => {
              setValue((prev) => VALUES[Math.max(0, VALUES.findIndex((v) => v == prev) - 1)]);
            }}
          >
            <ChevronLeft className="mr-2 -ml-1 h-4 w-4" />
            Back
          </Button>
          {value == VALUES.at(-1) ? (
            <DialogClose asChild>
              <Button variant={"secondary"} className="px-3">
                Finish
                <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
              </Button>
            </DialogClose>
          ) : (
            <Button
              variant={"ghost"}
              className="px-3"
              onClick={() => {
                setValue((prev) => VALUES[Math.min(VALUES.length - 1, VALUES.findIndex((v) => v == prev) + 1)]);
              }}
            >
              Next
              <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
