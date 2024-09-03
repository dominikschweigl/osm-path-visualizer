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

const LOCATION_TYPES = ["city", "town", "village", "highway"];

interface LocationsInputProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
}

export default function LocationsInput({ start, destination, setStart, setDestination, setViewState }: LocationsInputProps) {
  const [locations, setLocations] = useState<Map<string, MapLocation>>(new Map());

  const cities = Array.from(locations.values()).filter((location) => ["city", "town", "village"].includes(location.addresstype));

  const streets = Array.from(locations.values()).filter((location) => ["highway"].includes(location.addresstype));

  const [startValue, setStartValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");

  const destinationFetchController = useRef<AbortController>(new AbortController());
  const startFetchController = useRef<AbortController>(new AbortController());

  const [startLoading, setStartLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  useEffect(() => {
    if (!start) {
      setStartValue("");
      return;
    }
    setStartValue(`${start.city}, ${start.region}, ${start.country}`);
    locations.set(`${start.city}, ${start.region}, ${start.country}`, start);
  }, [start, locations]);

  useEffect(() => {
    if (!destination) {
      setDestinationValue("");
      return;
    }
    setDestinationValue(`${destination.city}, ${destination.region}, ${destination.country}`);
    locations.set(`${destination.city}, ${destination.region}, ${destination.country}`, destination);
  }, [destination, locations]);

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
        <div className="flex flex-col gap-2 md:gap-4 w-full">
          <div className="grid gap-2 w-full">
            <Command tabIndex={1}>
              <CommandInput
                id="start"
                value={`${startValue}`}
                placeholder="Search for a starting location..."
                onValueChange={async (s) => {
                  setStartValue(s);
                  // await new Promise((_) => setTimeout(() => {}, 50));
                  try {
                    setStartLoading(true);
                    const new_locations = await fetchLocationsByName(s, startFetchController);
                    setStartLoading(false);
                    setLocations((prev) => {
                      const locations = new Map(prev);
                      new_locations.forEach((l) => locations.set(`${l.city}, ${l.region}, ${l.country}`, l));
                      return locations;
                    });
                  } catch (e) {
                    if (e == fetchError.ABORT) {
                      setStartLoading(true);
                    } else {
                      setStartLoading(false);
                    }
                  }
                }}
                onBlur={() => setStartValue(start ? `${start.city}, ${start.region}, ${start.country}` : "")}
              />
              <CommandList>
                {startLoading ? (
                  <CommandEmpty>
                    <LoadingSpinner className="mx-auto" />
                  </CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>No Locations found.</CommandEmpty>
                    {cities.length > 0 && (
                      <CommandGroup heading="Cities">
                        {cities
                          .filter((location) => `${location.city}, ${location.region}, ${location.country}`.toLowerCase().includes(startValue.toLowerCase()))
                          .sort((a, b) => b.importance - a.importance)
                          .filter((_, i) => i < 3)
                          .map((location) => (
                            <CommandItem
                              key={location.geoLocation.id}
                              value={`${location.city}, ${location.region}, ${location.country}`}
                              onSelect={async (v) => {
                                setStartValue(v);
                                document.getElementById(document.activeElement?.id as string)?.blur();
                                try {
                                  setStart(location);
                                  setViewState((prev) =>
                                    destination
                                      ? {
                                          ...prev,
                                          zoom: getMapZoomForDistance(distanceBetweenNodes(destination.geoLocation, location.geoLocation)),
                                          latitude: (location.geoLocation.lat + destination.geoLocation.lat) / 2,
                                          longitude: (location.geoLocation.lon + destination.geoLocation.lon) / 2,
                                        }
                                      : { ...prev, latitude: location.geoLocation.lat, longitude: location.geoLocation.lon }
                                  );
                                } catch (err) {
                                  if (err == fetchError.NO_NODE_IN_PROXIMITY) {
                                    //TODO: possibly use toast promise
                                    toast.error("No Street found nearby", {
                                      icon: <CircleSlash color="#db2424" />,
                                      description: "Choose a start Location on a road",
                                    });
                                  } else {
                                    toast.error("Try again", {
                                      icon: <CircleSlash color="#db2424" />,
                                      description: "Something went wrong",
                                    });
                                  }
                                }
                              }}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              <span>{`${location.city}, ${location.region}, ${location.country}`}</span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                    {/* {streets.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Streets">
                      {streets
                        .filter((location) => `${location.street}, ${location.city}, ${location.country}`.toLowerCase().includes(startValue.toLowerCase()))
                        .sort((a, b) => a.importance - b.importance)
                        .filter((_, i) => i < 3)
                        .map((location) => (
                          <CommandItem key={location.geoLocation.id} value={`${location.street}, ${location.city}, ${location.country}`}>
                            <Route className="mr-2 h-4 w-4" />
                            <span>{`${location.street}, ${location.city}, ${location.country}`}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </>
                )} */}
                  </>
                )}
              </CommandList>
            </Command>
          </div>
          <div className="ml-4 mr-2 md:hidden">
            <Separator />
          </div>

          <div className="grid gap-2">
            <Command className="" tabIndex={-2}>
              <CommandInput
                id="destination"
                value={destinationValue}
                // icon={<Goal className="mr-2 h-5 w-5 shrink-0 opacity-50" />}
                placeholder="Search for a destination location..."
                onValueChange={async (s) => {
                  setDestinationValue(s);
                  try {
                    setDestinationLoading(true);
                    const new_locations = await fetchLocationsByName(s, destinationFetchController);
                    setDestinationLoading(false);
                    setLocations((prev) => {
                      const locations = new Map(prev);
                      new_locations.forEach((l) => locations.set(`${l.city}, ${l.region}, ${l.country}`, l));
                      return locations;
                    });
                  } catch (e) {
                    if (e == fetchError.ABORT) {
                      setStartLoading(true);
                    } else {
                      setStartLoading(false);
                    }
                  }
                }}
                onBlur={() => setDestinationValue(destination ? `${destination.city}, ${destination.region}, ${destination.country}` : "")}
              />
              <CommandList>
                {destinationLoading ? (
                  <CommandEmpty>
                    <LoadingSpinner className="mx-auto" />
                  </CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>No locations found.</CommandEmpty>
                    {cities.length > 0 && (
                      <CommandGroup heading="Cities">
                        {cities
                          .filter((location) => `${location.street}, ${location.city}, ${location.country}`.toLowerCase().includes(destinationValue.toLowerCase()))
                          .sort((a, b) => b.importance - a.importance)
                          .filter((_, i) => i < 3)
                          .map((location) => (
                            <CommandItem
                              key={location.geoLocation.id}
                              value={`${location.city}, ${location.region}, ${location.country}`}
                              onSelect={async (v) => {
                                setDestinationValue(v);
                                document.getElementById(document.activeElement?.id as string)?.blur();

                                try {
                                  // if (!isWithinBoundingBox(location.geoLocation, boundingBox!)) {
                                  //   toast.error("Select a Destination inside your bounding circle", {
                                  //     icon: <CircleSlash color="#db2424" />,
                                  //     description: "Unlimited search will be added in version 2.0",
                                  //   });
                                  //   return;
                                  // }
                                  setDestination(location);
                                  setViewState((prev) =>
                                    start
                                      ? {
                                          ...prev,
                                          zoom: getMapZoomForDistance(distanceBetweenNodes(start.geoLocation, location.geoLocation)),
                                          latitude: (location.geoLocation.lat + start.geoLocation.lat) / 2,
                                          longitude: (location.geoLocation.lon + start.geoLocation.lon) / 2,
                                        }
                                      : { ...prev, latitude: location.geoLocation.lat, longitude: location.geoLocation.lon }
                                  );
                                } catch (err) {
                                  if (err == fetchError.NO_NODE_IN_PROXIMITY) {
                                    //TODO: possibly use toast promise
                                    toast.error("No Street found nearby", {
                                      icon: <CircleSlash color="#db2424" />,
                                      description: "Choose a destination Location on a road",
                                    });
                                  } else {
                                    toast.error("Try again", {
                                      icon: <CircleSlash color="#db2424" />,
                                      description: "Something went wrong",
                                    });
                                  }
                                }
                              }}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              <span>{`${location.city}, ${location.region}, ${location.country}`}</span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                    {/* {streets.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Streets">
                      {streets
                        .filter((location) => `${location.street}, ${location.city}, ${location.country}`.toLowerCase().includes(destinationValue.toLowerCase()))
                        .sort((a, b) => b.importance - a.importance)
                        .filter((_, i) => i < 3)
                        .map((location) => (
                          <CommandItem key={location.geoLocation.id} value={`${location.street}, ${location.city}, ${location.country}`}>
                            <Route className="mr-2 h-4 w-4" />
                            <span>{`${location.street}, ${location.city}, ${location.country}`}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </>
                )} */}
                  </>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

async function fetchLocationsByName(searchInput: string, previousController: MutableRefObject<AbortController>): Promise<Map<string, MapLocation>> {
  if (previousController.current) previousController.current.abort(fetchError.ABORT);
  const controller = new AbortController();
  previousController.current = controller;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${searchInput}&accept-language=en&limit=100&format=jsonv2&addressdetails&extratags&layer=address,poi`, {
      signal: controller.signal,
    });
    const data = await res.json();

    const locations = new Map<string, MapLocation>();
    for (const location of data) {
      if (!LOCATION_TYPES.includes(location.addresstype)) continue;
      locations.set(location.display_name, {
        type: "mapLocation",
        street: location.address.road,
        city: location.address.city || location.address.town || location.address.village,
        region: location.address.state,
        country: location.address.country,
        importance: location.importance,
        addresstype: location.addresstype,
        geoLocation: await getNearestNode({ type: "coordinates", lat: +location.lat, lon: +location.lon }, null),
      });
    }
    return locations;
  } catch (e) {
    return Promise.reject(e);
  }
}
