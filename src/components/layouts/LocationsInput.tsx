import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Footprints, Goal, House, Locate, LocateFixed, MapPin, MapPinned, Building2, School, Route, Loader2, Search } from "lucide-react";
import { MapViewState } from "@deck.gl/core";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Popover, PopoverTrigger } from "../ui/popover";
import getNearestNode from "@/lib/mapUtils/getNearestNode";
import { toast } from "sonner";
import { CircleSlash } from "lucide-react";
import { fetchError } from "../../lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import getMapZoomForDistance from "@/lib/mapUtils/getMapZoomForDistance";
import LoadingSpinner from "../ui/spinner";
import isWithinBoundingBox from "@/lib/mapUtils/isWithinBoundingBox";

const LOCATION_TYPES = ["city", "town", "village", "highway"];

export default function LocationsInput({
  start,
  destination,
  boundingBox,
  searchLoading,
  searchStarted,
  setStart,
  setDestination,
  setViewState,
  setSearchStarted,
  setSearchLoading,
}: {
  start: MapLocation | null;
  destination: MapLocation | null;
  boundingBox: BoundingBox | null;
  searchLoading: boolean;
  searchStarted: boolean;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewState: Dispatch<SetStateAction<MapViewState>>;
  setSearchStarted: Dispatch<SetStateAction<boolean>>;
  setSearchLoading: Dispatch<SetStateAction<boolean>>;
}) {
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
  }, [start]);

  useEffect(() => {
    if (!destination) {
      setDestinationValue("");
      return;
    }
    setDestinationValue(`${destination.city}, ${destination.region}, ${destination.country}`);
    locations.set(`${destination.city}, ${destination.region}, ${destination.country}`, destination);
  }, [destination]);

  return (
    <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
      <legend className="-ml-1 px-1 text-sm font-medium">Locations</legend>
      <div className="grid gap-2">
        <div className="flex flex-nowrap">
          <Label htmlFor="start">Start</Label>
        </div>
        <Command className="">
          <CommandInput
            id="start"
            value={`${startValue}`}
            icon={<MapPinned className="mr-2 h-5 w-5 shrink-0 opacity-50" />}
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
      <div className="grid gap-2">
        <Label htmlFor="destination">Destination</Label>
        <Command className="">
          <CommandInput
            id="destination"
            value={destinationValue}
            icon={<Goal className="mr-2 h-5 w-5 shrink-0 opacity-50" />}
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
                              if (!isWithinBoundingBox(location, boundingBox!)) {
                                toast.error("Select a Destination inside your bounding circle", {
                                  icon: <CircleSlash color="#db2424" />,
                                  description: "Unlimited search will be added in version 2.0",
                                });
                                return;
                              }
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
      <Button
        onClick={() => {
          if (!start || !destination) return;
          setSearchStarted(true);
          setSearchLoading(true);
        }}
        type="button"
        className="relative"
        disabled={searchLoading || searchStarted}
      >
        {searchLoading ? <LoadingSpinner size={16} className="left-4 mr-2" /> : <Search size={16} className="left-4 mr-2" />}
        Search
      </Button>
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
