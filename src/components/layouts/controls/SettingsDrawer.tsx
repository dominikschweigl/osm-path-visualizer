"use client";

import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import PlaybackControls from "@/components/layouts/controls/PlaybackControls";
import { Dispatch, SetStateAction } from "react";
import { MapViewState } from "@deck.gl/core";
import { MapLocation, PathfinderState, PathfindingAnimation } from "@/lib/types";
import Settings from "./Settings";
import { Separator } from "@/components/ui/separator";
import useWindowResize from "@/hooks/useWindowResize";

interface SettingsDrawerProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewstate: Dispatch<SetStateAction<MapViewState>>;
  children?: React.ReactNode;
}

export default function SettingsDrawer({ start, destination, pathfinder, animation, setStart, setDestination, setViewstate, children }: SettingsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>("250px");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useWindowResize(() => setIsOpen(window.innerWidth < 768));

  useEffect(() => {
    if (animation.isAnimationPlaying) {
      setSnap("250px");
    }
  }, [animation]);

  return (
    <Drawer modal={false} open={isOpen} snapPoints={["250px", 1]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} dismissible={false}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="px-4 outline-none z-50 shadow-sm-top">
        <DrawerHeader>
          <DrawerTitle>Configuration</DrawerTitle>
          <DrawerDescription>Configure the settings for the search algorithm and animation.</DrawerDescription>
        </DrawerHeader>
        <form className="flex flex-col items-start gap-6 pb-10 pt-4">
          <Settings animation={animation} pathfinder={pathfinder} />
          <Separator className="my-2 h-px" />
          <PlaybackControls animation={animation} />
        </form>
      </DrawerContent>
    </Drawer>
  );
}
