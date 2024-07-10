"use client";
import Map, { Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { LineLayer } from "react-map-gl/maplibre";
import { queryStreets } from "@/lib/overpassQuery";
import Graph from "@/lib/graph/Graph";

const MAP_STYLE = "https://api.maptiler.com/maps/9c94b982-e008-4449-bb86-d3d7e79f8f4e/style.json?key=Jn6z9F7PwQrDmuB1lfHJ";
const INITIAL_ZOOM = 13;

const searchLayer: LineLayer = {
  id: "search",
  type: "line",
  source: "mapbox",
  "source-layer": "streets",
};

export default function Pathfinder() {
  const [viewState, setViewState] = useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: INITIAL_ZOOM,
  });

  const bound: [Coordinates, Coordinates] = [
    { longitude: 47.27869216016305, latitude: 11.35940432664907 },
    { longitude: 47.24997680179206, latitude: 11.43819689867027 },
  ];

  // queryStreets(bound).then(console.log);

  return (
    <div className="h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle={MAP_STYLE}
        onLoad={() => getUserPosition(setViewState)}
        onClick={(e) => {
          console.log(e);
        }}
        doubleClickZoom={false}
      >
        <Layer {...searchLayer} />
      </Map>
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
