import Map, { Marker, useControl } from "react-map-gl/maplibre";
import { MapViewState } from "@deck.gl/core";
import * as maptiler from "@maptiler/sdk";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { DeckProps } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGL from "@deck.gl/react";
import getUserPosition from "@/lib/mapUtils/getUserPosition";
import { handleMapClickDesktop } from "@/lib/mapUtils/handleMapClickDesktop";
import { TripsLayer } from "@deck.gl/geo-layers";
import { Dispatch, SetStateAction, useRef } from "react";
import Edge from "@/lib/datastructures/graph/Edge";
import { MapLocation, PathfinderState, PathfindingAnimation } from "@/lib/types";
import { primaryInput } from "detect-it";
import { handleMapClickMobile } from "@/lib/mapUtils/handleMapClickMobile";
import { MapPin } from "lucide-react";

const MAP_STYLE = maptiler.MapStyle.STREETS.LIGHT.getExpandedStyleURL().concat("?key=Jn6z9F7PwQrDmuB1lfHJ");

interface PathfinderMapProps {
  start: MapLocation | null;
  destination: MapLocation | null;
  pathfinder: PathfinderState;
  animation: PathfindingAnimation;
  viewstate: MapViewState;
  setStart: Dispatch<SetStateAction<MapLocation | null>>;
  setDestination: Dispatch<SetStateAction<MapLocation | null>>;
  setViewstate: Dispatch<SetStateAction<MapViewState>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function PathfinderMap({ start, destination, viewstate, pathfinder, animation, setStart, setDestination, setViewstate, setLoading }: PathfinderMapProps) {
  const previousClickAbortController = useRef<AbortController | null>(null);

  const layers = [
    new TripsLayer<Edge>({
      id: "search-layer",
      data: pathfinder.searchPaths,
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      getTimestamps: (e) => {
        return [Math.fround(e.getStart().getSearchVisitTime()), Math.fround(e.getEnd().getSearchVisitTime())];
      },
      currentTime: animation.searchLayerTime,
      getColor: [0, 0, 0],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 2,
    }),
    new TripsLayer<Edge>({
      id: "shortest-path-layer",
      data: pathfinder.shortestPath,
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      currentTime: animation.time,
      getTimestamps: (e) => {
        return [Math.fround(e.getStart().getTrackBackVisitTime()), Math.fround(e.getEnd().getTrackBackVisitTime())];
      },
      getColor: [13, 131, 252],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 4,
    }),
  ];

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <DeckGL
        initialViewState={viewstate}
        layers={layers}
        controller={{ doubleClickZoom: false, dragRotate: false, inertia: true }}
        onClick={(info, event) => {
          if (primaryInput === "mouse") {
            handleMapClickDesktop(info, event, previousClickAbortController, setStart, setDestination, setLoading);
          } else {
            handleMapClickMobile(info, event, start, previousClickAbortController, setStart, setDestination, setLoading);
          }
        }}
      >
        <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(viewstate.zoom, setViewstate)} locale={"en"}>
          {start !== null && (
            <Marker latitude={start.geoLocation.lat} longitude={start.geoLocation.lon}>
              <div className="size-4 rounded-full border-black border-[2px] bg-white"></div>{" "}
            </Marker>
          )}
          {destination !== null && (
            <Marker latitude={destination.geoLocation.lat} longitude={destination.geoLocation.lon} offset={[0, -10]}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 10C20 14.993 14.461 20.193 12.601 21.799C12.4277 21.9293 12.2168 21.9998 12 21.9998C11.7832 21.9998 11.5723 21.9293 11.399 21.799C9.539 20.193 4 14.993 4 10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10Z"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Marker>
          )}
        </Map>
      </DeckGL>
    </div>
  );
}
