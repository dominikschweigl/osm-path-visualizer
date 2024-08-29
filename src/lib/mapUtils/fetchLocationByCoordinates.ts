import { MutableRefObject } from "react";
import getNearestNode from "@/lib/mapUtils/getNearestNode";
import { fetchError } from "../../lib/constants";
import { MapLocation } from "../types";

export default async function fetchLocationByCoordinates(
  latitude: number,
  longitude: number,
  zoom: number,
  previousController: MutableRefObject<AbortController> | null
): Promise<MapLocation> {
  const controller = new AbortController();
  if (previousController) {
    previousController.current.abort(fetchError.ABORT);
    previousController.current = controller;
  }
  const [location, geoLocation] = await Promise.all([
    fetch(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${latitude}&lon=${longitude}&zoom=${Math.floor(zoom) > 5 ? 17 : Math.floor(zoom)}&accept-language=en&format=jsonv2`,
      {
        signal: controller.signal,
      }
    ).then((r) => r.json()),
    getNearestNode({ type: "coordinates", lat: latitude, lon: longitude }, null),
  ]);

  const mapLocation: MapLocation = {
    type: "mapLocation",
    street: location.address.road,
    city: location.address.city || location.address.town || location.address.village,
    region: location.address.state || location.address.county,
    country: location.address.country,
    importance: location.importance,
    addresstype: location.addresstype,
    geoLocation: geoLocation,
  };

  return mapLocation;
}
