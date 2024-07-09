"use client";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";

const MAP_STYLE = "https://api.maptiler.com/maps/9c94b982-e008-4449-bb86-d3d7e79f8f4e/style.json?key=Jn6z9F7PwQrDmuB1lfHJ";
const INITIAL_ZOOM = 13;

export default function Pathfinder() {
  const [viewState, setViewState] = useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: INITIAL_ZOOM,
  });

  return (
    <div className="h-full">
      <Map {...viewState} onMove={(e) => setViewState(e.viewState)} mapStyle={MAP_STYLE} onLoad={() => getUserPosition(setViewState)} />
    </div>
  );
}

function getUserPosition(setViewState: Dispatch<SetStateAction<{ longitude: number; latitude: number; zoom: number }>>) {
  navigator.geolocation.getCurrentPosition((position) => {
    setViewState({
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
      zoom: INITIAL_ZOOM,
    });
    console.log(position.coords);
  });
}
