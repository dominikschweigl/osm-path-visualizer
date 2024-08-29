import Map, { Marker, useControl } from "react-map-gl/maplibre";
import { MapViewState } from "@deck.gl/core";
import * as maptiler from "@maptiler/sdk";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { DeckProps } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGL from "@deck.gl/react";
import getUserPosition from "@/lib/mapUtils/getUserPosition";
import { handleMapClick } from "@/lib/mapUtils/handleMapClick";
import { TripsLayer } from "@deck.gl/geo-layers";
import { Dispatch, SetStateAction, useRef } from "react";
import Edge from "@/lib/datastructures/graph/Edge";
import { MapLocation, PathfinderState, PathfindingAnimation } from "@/lib/types";

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
}

export default function PathfinderMap({ start, destination, viewstate, pathfinder, animation, setStart, setDestination, setViewstate }: PathfinderMapProps) {
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
    // new PolygonLayer<Coordinates[]>({
    //   id: "search-tile",
    //   data: pathfinder.searchTile
    //     ? [
    //         [
    //           { type: "coordinates", lat: pathfinder.searchTile.top, lon: pathfinder.searchTile.left },
    //           { type: "coordinates", lat: pathfinder.searchTile.top, lon: pathfinder.searchTile.right },
    //           { type: "coordinates", lat: pathfinder.searchTile.bottom, lon: pathfinder.searchTile.right },
    //           { type: "coordinates", lat: pathfinder.searchTile.bottom, lon: pathfinder.searchTile.left },
    //         ],
    //       ]
    //     : [],
    //   getPolygon: (ps) => ps.map((p) => [p.lon, p.lat]),
    //   getElevation: 10,
    //   getFillColor: [0, 0, 0, 0],
    //   getLineColor: [0, 0, 0],
    //   getLineWidth: 4,
    //   lineWidthMinPixels: 4,
    //   pickable: true,
    // }),
  ];

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <DeckGL
        initialViewState={viewstate}
        controller={{ doubleClickZoom: false, dragRotate: false, inertia: true }}
        onClick={(info, event) => {
          handleMapClick(info, event, setStart, setDestination, previousClickAbortController);
        }}
      >
        <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(viewstate.zoom, setViewstate)} locale={"en"}>
          {start !== null && <Marker latitude={start.geoLocation.lat} longitude={start.geoLocation.lon} color="#000" />}
          {destination !== null && <Marker latitude={destination.geoLocation.lat} longitude={destination.geoLocation.lon} color="#000" />}
          {
            //@ts-ignore
            <DeckGLOverlay layers={layers} interleaved />
          }
        </Map>
      </DeckGL>
    </div>
  );
}

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
