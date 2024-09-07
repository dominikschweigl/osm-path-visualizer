"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Clapperboard, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Text } from "../ui/typography";
import useWindowResize from "@/hooks/useWindowResize";

const VALUES = ["map", "playback", "settings"];

interface TutorialDialogProps {
  children: React.ReactNode;
}

export default function TutorialDialog({ children }: TutorialDialogProps) {
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

  const [windowHeight, setWindowHeight] = useState<number>(0);
  useWindowResize(() => setWindowHeight(window.innerHeight));

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[95vh] max-w-[min(864px,95vw)] flex flex-col">
        <DialogHeader>
          <DialogTitle>OSM Pathfinder Tutorial</DialogTitle>
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
          <TabsContent value="map">
            <div className="w-full aspect-[16/8.4] rounded-xl border overflow-hidden">
              <video className="-mt-[15px] ml-px" autoPlay loop muted>
                <source src="/osm-path-visualizer/tutorial/map.mp4" type="video/mp4" />
              </video>
            </div>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Map Controls
            </Text>
            <Text element="p" as={"p"} className={`mt-2 ${windowHeight < 760 ? "truncate" : ""}`}>
              The Map can be navigated by holding the left mouse button and dragging in the desired direction. Map Zoom is controlled by the scroll wheel. Start and Destination
              Locations can be set by clicking on the map or searching the city name in the input fields.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li className="hidden md:list-item">
                <span className="font-medium">Left Click</span>: Place start position
              </li>
              <li className="md:hidden">
                <span className="font-medium">1st Click</span>: Place start position
              </li>
              <li className="hidden md:list-item">
                <span className="font-medium">Right Click</span>: Place destination position
              </li>
              <li className="md:hidden">
                <span className="font-medium">2nd Click</span>: Place destination position
              </li>
              <li>
                <span className="font-medium">Location Input</span>: Search for your City by name
              </li>
            </Text>
          </TabsContent>
          <TabsContent value="playback">
            <div className="w-full aspect-[16/8.4] rounded-xl border overflow-hidden">
              <video className="-mt-[15px] ml-px" autoPlay loop muted>
                <source src="/osm-path-visualizer/tutorial/playback.mp4" type="video/mp4" />
              </video>
            </div>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Playback Controls
            </Text>
            <Text element="p" as={"p"} className={`mt-2 ${windowHeight < 760 ? "truncate" : ""}`}>
              To start the visualization, press the Start Button. A playback feature is available after the algorithm ends. You can rewatch the algorithm from any point in time or
              clear the path by dragging the animation slider to the desired position.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li>
                <span className="font-medium">Animation Time</span>: Drag the handle see specific time frames or use the control buttons
              </li>
              <li>
                <span className="font-medium">Retract Search Paths</span>: deactivate to continue showing searched paths on found destination
              </li>
            </Text>
          </TabsContent>
          <TabsContent value="settings">
            <div className="w-full aspect-[16/8.4] rounded-xl border overflow-hidden">
              <video className="-mt-[15px] ml-px" autoPlay loop muted>
                <source src="/osm-path-visualizer/tutorial/settings.mp4" type="video/mp4" />
              </video>
            </div>
            <Text element={"h3"} as={"h3"} className="mt-6">
              Settings
            </Text>
            <Text element="p" as={"p"} className={`mt-2 ${windowHeight < 760 ? "truncate" : ""}`}>
              You can customize the settings of the animation in the Settings Sidebar. With Increasing distance the calculation may take a while depending on your device and
              internet connection.
            </Text>
            <Text element="ul" as={"ul"} className="mt-3 mb-0">
              <li>
                <span className="font-medium">Animation Speed</span>: Changes how fast the animation will play
              </li>
              <li>
                <span className="font-medium">Search Algorithm</span>: Selects the used algorithm (some are only suited for short distances)
              </li>
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
