"use client";
import Map, { Marker, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGL, { DeckGLRef } from "@deck.gl/react";
import { PolygonLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { useEffect, useRef, useState } from "react";
import { queryStreets } from "@/lib/mapUtils/overpassQuery";
import Graph from "@/lib/datastructures/graph/Graph";
import Edge from "@/lib/datastructures/graph/Edge";
import { createGeoJSONCircle } from "@/lib/mapUtils/createGeoJSONCircle";
import LocationsInput from "@/components/layouts/LocationsInput";
import getUserPosition from "@/lib/mapUtils/getUserPosition";
import getBoundingBoxFromPolygon from "@/lib/mapUtils/getBoundingBoxFromPolygon";
import getNearestNode from "@/lib/mapUtils/getNearestNode";

import DijkstraPathFinder from "@/lib/pathFindingAlgorithms/DijkstraPathFinder";
import { Button } from "@/components/ui/button";
import Node from "@/lib/datastructures/graph/Node";
import { handleMapClick } from "@/lib/mapUtils/handleMapClick";
import { fetchError } from "@/lib/errors";

const MAP_STYLE = "https://api.maptiler.com/maps/9c94b982-e008-4449-bb86-d3d7e79f8f4e/style.json?key=Jn6z9F7PwQrDmuB1lfHJ";
const INITIAL_ZOOM = 13;

const SEARCH_RADIUS = 2;

export default function Pathfinder() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 11.39,
    latitude: 47.27,
    zoom: INITIAL_ZOOM,
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
    transitionDuration: "auto",
  });
  const [start, setStart] = useState<GeoLocationPoint | null>(null);
  const [destination, setDestination] = useState<GeoLocationPoint | null>(null);

  const [graph, setGraph] = useState<Graph>();
  const [pathfinder, setPathfinder] = useState<DijkstraPathFinder>();
  const [searchPaths, setSearchPaths] = useState<Edge[]>([]);

  const bound: BoundingBox | null = start && getBoundingBoxFromPolygon(createGeoJSONCircle(start, SEARCH_RADIUS));

  const [searchStarted, setSearchStarted] = useState(false);

  useEffect(() => {
    if (!searchStarted) return;
    const interval = setInterval(() => {
      if (!pathfinder) {
        clearInterval(interval);
        return;
      }
      const destinationFound = pathfinder.nextStep(setSearchPaths);
      if (destinationFound) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [searchStarted]);

  useEffect(() => {
    if (!start || !destination) return;

    const controller = new AbortController();
    queryStreets(bound!, controller.signal)
      .then(([nodes, ways]) => {
        const newGraph = new Graph(start.id, destination.id, nodes, ways);
        setGraph(newGraph);
        setPathfinder(new DijkstraPathFinder(newGraph));
      })
      .catch(() => {});

    return () => {
      controller.abort(fetchError.ABORT);
    };
  }, [start, destination]);

  const layers = [
    new TripsLayer<Edge>({
      id: "path-layer",
      data: graph?.getEdges(),
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      getColor: [253, 128, 93],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 3,
    }),

    new TripsLayer<Edge>({
      id: "search-layer",
      data: searchPaths,
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      getColor: [3, 252, 132],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 5,
    }),
    new PolygonLayer<Coordinates[]>({
      id: "circle",
      data: start ? [createGeoJSONCircle(start, SEARCH_RADIUS)] : [],
      getPolygon: (ps) => ps.map((p) => [p.lon, p.lat]),
      getElevation: 10,
      getFillColor: [0, 0, 0, 0],
      getLineColor: [0, 0, 0],
      getLineWidth: 4,
      lineWidthMinPixels: 4,
      pickable: true,
    }),
  ];

  const deck = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const abort = (e) => {
  //     // e.preventDefault();
  //     console.log(e);
  //     clickAbortController.abort();
  //   };
  //   deck.current?.ondblclick((e: MouseEvent) => abort(e));
  //   return () => deck.current?.deck?.getCanvas()?.removeEventListener("dblclick", abort);
  // }, [deck]);

  const lastClick = useRef<number>(0);

  const previousClickAbortController = useRef<AbortController | null>(null);

  return (
    <div className="h-full">
      <div className="w-[400px] z-10 relative left-6 top-6 flex flex-col gap-3">
        <LocationsInput start={start} destination={destination} />
        <Button onClick={() => setSearchStarted(true)}>Start Search</Button>
      </div>
      <div ref={deck} onContextMenu={(e) => e.preventDefault()}>
        <DeckGL
          initialViewState={viewState}
          controller={{ doubleClickZoom: false, dragRotate: false, inertia: true }}
          layers={layers}
          onClick={(info, event) => {
            handleMapClick(info, event, setStart, setDestination, lastClick, previousClickAbortController);
          }}
        >
          <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(INITIAL_ZOOM, setViewState)}>
            {start !== null && <Marker latitude={start.lat} longitude={start.lon} color="#000000" />}
            {destination !== null && <Marker latitude={destination.lat} longitude={destination.lon} />}
          </Map>
        </DeckGL>
      </div>
    </div>
  );
}
