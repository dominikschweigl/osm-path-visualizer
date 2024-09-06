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
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
  children?: React.ReactNode;
}

export default function SettingsDrawer({ pathfinder, animation, children }: SettingsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  useWindowResize(() => setIsOpen(window.innerWidth < 768));
  useWindowResize(() => setWindowHeight(window.innerHeight));

  useEffect(() => {
    if (animation.isAnimationPlaying) {
      setSnap(`${windowHeight - 436}px`);
    }
  }, [animation]);

  return (
    <Drawer modal={false} open={isOpen} snapPoints={[`${windowHeight - 436}px`, 1]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} dismissible={false}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={`px-4 outline-none z-50 shadow-sm-top`}>
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
