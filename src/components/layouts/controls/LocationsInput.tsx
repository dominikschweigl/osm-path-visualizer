import { Label } from "@/components/ui/label";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Building2, Circle, Dot, MapPin } from "lucide-react";
import { MapViewState } from "@deck.gl/core";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import getNearestNode from "@/lib/mapUtils/getNearestNode";
import { toast } from "sonner";
import { CircleSlash } from "lucide-react";
import { fetchError } from "../../../lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import getMapZoomForDistance from "@/lib/mapUtils/getMapZoomForDistance";
import LoadingSpinner from "../../ui/spinner";
import { MapLocation } from "@/lib/types";
import { Text } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";

const SearchAddress = dynamic(() => import("@/components/ui/search-address"), {
  ssr: false,
});

const LOCATION_TYPES = ["city", "town", "village", "highway"];

interface LocationsInputProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function LocationsInput({ start, destination, setStart, setDestination, setViewState, setLoading }: LocationsInputProps) {
  return (
    <fieldset className="grid gap-4 w-full">
      <Text as={"h5"} element="h2" className="hidden md:block">
        Locations
      </Text>
      <div className="flex flex-nowrap">
        <div className="h-full flex flex-col justify-between items-center pt-[16px] pb-[12px] pr-1 md:pr-3">
          <div className="size-4 rounded-full border-gray-500 border-[2px]"></div>
          <div className="grid gap-1.5">
            <div className="size-[3px] rounded-full border-gray-500 bg-gray-500"></div>
            <div className="size-[3px] rounded-full border-gray-500 bg-gray-500"></div>
            <div className="size-[3px] rounded-full border-gray-500 bg-gray-500"></div>
          </div>
          <MapPin className="size-5 text-blue-500" />
        </div>
        <div className="flex flex-col gap-2 md:gap-4 w-full min-h-[109px]">
          <div className="grid gap-2 w-full">
            <SearchAddress
              label={start?.label}
              placeholder={"Select a start location..."}
              onSelectLocation={async (l: any) => {
                if (!l) return;
                setLoading(true);
                await setMapLocation(l, destination, setStart, setViewState);
                setLoading(false);
              }}
            />
          </div>

          <div className="ml-4 mr-2 md:hidden">
            <Separator />
          </div>

          <div className="grid gap-2">
            <SearchAddress
              label={destination?.label}
              placeholder={"Select a destination location..."}
              onSelectLocation={async (l: any) => {
                if (!l) return;
                setLoading(true);
                await setMapLocation(l, start, setDestination, setViewState);
                setLoading(false);
              }}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

async function setMapLocation(
  location: any,
  otherLocation: MapLocation | null,
  setLocation: Dispatch<SetStateAction<MapLocation | null>>,
  setViewstate: Dispatch<SetStateAction<MapViewState>>
): Promise<void> {
  const new_start: MapLocation = {
    type: "mapLocation",
    street: location.raw.address.road,
    city: location.raw.address.city || location.raw.address.town || location.raw.address.village,
    region: location.raw.address.state,
    country: location.raw.address.country,
    importance: location.raw.importance,
    addresstype: location.raw.addresstype,
    label: location.label,
    geoLocation: await getNearestNode({ type: "coordinates", lat: location.y, lon: location.x }, null),
  };

  setLocation(new_start);

  setViewstate((prev) =>
    otherLocation
      ? {
          ...prev,
          zoom: getMapZoomForDistance(distanceBetweenNodes(otherLocation.geoLocation, new_start.geoLocation)),
          latitude: (new_start.geoLocation.lat + otherLocation.geoLocation.lat) / 2,
          longitude: (new_start.geoLocation.lon + otherLocation.geoLocation.lon) / 2,
        }
      : { ...prev, latitude: new_start.geoLocation.lat, longitude: new_start.geoLocation.lon }
  );

  return Promise.resolve();
}
