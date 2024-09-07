"use client";

import { Compass, Github, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TutorialDialog from "@/components/layouts/TutorialDialog";
import { Text } from "../ui/typography";
import Link from "next/link";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

export default function Navigation() {
  return (
    <header className="absolute md:sticky w-full bg-white md:bg-transparent top-0 z-40 flex items-center gap-1 md:gap-2 p-4 pb-3 md:p-6 md:py-8">
      <Compass size={24} />
      <Text as="h4" element="h1" className="hidden sm:block">
        OSM Pathfinding Visualizer
      </Text>
      <Text as="h4" element="h1" className="sm:hidden">
        OSM Pathfinder
      </Text>
      <Badge variant={"secondary"} className="ml-1">
        v 2.0
      </Badge>
      <Menu />
      <div className="ml-auto flex">
        <TutorialDialog>
          <Button className="md:hidden" variant={"ghost"} size={"icon"}>
            <Play className="size-4" />
          </Button>
        </TutorialDialog>
        <Link href="https://github.com/dominikschweigl/osm-path-visualizer" target="_blank" className="hidden lg:block">
          <Button variant={"link"} className="gap-1.5">
            <Github className="size-4" />
            dominikschweigl/osm-path-visualizer
          </Button>
        </Link>
        <Link href="https://github.com/dominikschweigl/osm-path-visualizer" target="_blank" className="lg:hidden">
          <Button variant={"ghost"} size={"icon"}>
            <Github className="size-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

export function Menu() {
  return (
    <NavigationMenu className="lg:ml-4 hidden md:block">
      <NavigationMenuList>
        <NavigationMenuItem>
          <TutorialDialog>
            <NavigationMenuLink className={navigationMenuTriggerStyle() + " cursor-pointer"}>Tutorial</NavigationMenuLink>
          </TutorialDialog>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="https://github.com/dominikschweigl/osm-path-visualizer" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} target="_blank">
              Documentation
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
