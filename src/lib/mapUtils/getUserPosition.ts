import { Dispatch, SetStateAction } from "react";
import { FlyToInterpolator, MapViewState } from "@deck.gl/core";

export default function getUserPosition(zoom: number, setViewState: Dispatch<SetStateAction<MapViewState>>) {
  navigator.geolocation.getCurrentPosition((position) => {
    setViewState({
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
      zoom: zoom,
      transitionInterpolator: new FlyToInterpolator({ speed: 2.5 }),
      transitionDuration: "auto",
      pitch: 0,
    });
  });
}
