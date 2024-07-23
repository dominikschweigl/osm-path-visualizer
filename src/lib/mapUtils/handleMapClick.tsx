import getNearestNode from "./getNearestNode";
import { toast } from "sonner";
import { CircleSlash } from "lucide-react";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { PickingInfo } from "@deck.gl/core";
import { MjolnirGestureEvent } from "mjolnir.js";
import { fetchError } from "../errors";

export async function handleMapClick(
  info: PickingInfo,
  event: MjolnirGestureEvent,
  setStart: Dispatch<SetStateAction<GeoLocationPoint | null>>,
  setDestination: Dispatch<SetStateAction<GeoLocationPoint | null>>,
  lastClickRef: MutableRefObject<number>,
  previousController: MutableRefObject<AbortController | null>
) {
  if (previousController.current) previousController.current.abort(fetchError.ABORT);
  const controller = new AbortController();
  previousController.current = controller;

  const lastClick = lastClickRef.current;

  lastClickRef.current = event.timeStamp;
  event.preventDefault();

  if (event.timeStamp - lastClick > 200) return;

  if (!info.coordinate) return;

  if (event.leftButton) {
    try {
      const node = await getNearestNode({ type: "coordinates", lat: info.coordinate[1], lon: info.coordinate[0] }, controller.signal);
      setStart(node);
    } catch (err) {
      if (err == fetchError.NO_NODE_IN_PROXIMITY) {
        //TODO: possibly use toast promise
        toast.error("No Street found nearby", {
          icon: <CircleSlash color="#db2424" />,
          description: "Choose a start Location on a road",
        });
      }
    }
  }

  if (event.rightButton) {
    try {
      const node = await getNearestNode({ type: "coordinates", lat: info.coordinate[1], lon: info.coordinate[0] }, controller.signal);
      setDestination(node);
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
