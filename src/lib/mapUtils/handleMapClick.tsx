import getNearestNode from "./getNearestNode";
import { toast } from "sonner";
import { CircleSlash } from "lucide-react";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { PickingInfo } from "@deck.gl/core";
import { MjolnirGestureEvent } from "mjolnir.js";
import { fetchError } from "../constants";
import fetchLocationByCoordinates from "./fetchLocationByCoordinates";
import isWithinBoundingBox from "./isWithinBoundingBox";
import getBoundingBoxFromPolygon from "./getBoundingBoxFromPolygon";
import { createGeoJSONCircle } from "./createGeoJSONCircle";

export async function handleMapClick(
  info: PickingInfo,
  event: MjolnirGestureEvent,
  setStart: Dispatch<SetStateAction<MapLocation | null>>,
  setDestination: Dispatch<SetStateAction<MapLocation | null>>,
  bound: BoundingBox | null,
  lastClickRef: MutableRefObject<number>,
  previousController: MutableRefObject<AbortController | null>
) {
  if (previousController.current) previousController.current.abort(fetchError.ABORT);
  const controller = new AbortController();
  previousController.current = controller;

  const lastClick = lastClickRef.current;

  lastClickRef.current = event.timeStamp;
  event.preventDefault();

  // if (event.timeStamp - lastClick > 200) return;

  if (!info.coordinate) return;

  if (event.leftButton) {
    try {
      setStart(await fetchLocationByCoordinates(info.coordinate[1], info.coordinate[0], info.viewport?.zoom!, null));
      setDestination(null);
    } catch (err) {
      if (err == fetchError.NO_NODE_IN_PROXIMITY) {
        //TODO: possibly use toast promise
        toast.error("No Street found nearby", {
          icon: <CircleSlash color="#db2424" />,
          description: "Choose a start Location on a road",
        });
      }
    }
    return;
  }

  if (!bound) {
    toast.error("First Select a starting Point", {
      icon: <CircleSlash color="#db2424" />,
      description: "Double click the left mouse button",
    });
    return;
  }

  if (event.rightButton) {
    try {
      const location = await fetchLocationByCoordinates(info.coordinate[1], info.coordinate[0], info.viewport?.zoom!, null);
      if (!isWithinBoundingBox(location, bound)) {
        toast.error("Select a Destination inside your bounding circle", {
          icon: <CircleSlash color="#db2424" />,
          description: "Unlimited search will be added in version 2.0",
        });
        return;
      }
      setDestination(location);
    } catch (err) {
      if (err == fetchError.NO_NODE_IN_PROXIMITY) {
        toast.error("No Street found nearby", {
          icon: <CircleSlash color="#db2424" />,
          description: "Choose a destination Location on a road",
        });
      }
    }
  }
}
