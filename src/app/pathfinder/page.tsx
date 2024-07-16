"use client";
import Map, { Marker, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGL, { DeckGLRef } from "@deck.gl/react";
import { LineLayer, PolygonLayer } from "@deck.gl/layers";
import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { queryStreets } from "@/lib/mapUtils/overpassQuery";
import Graph from "@/lib/graph/Graph";
import Edge from "@/lib/graph/Edge";
import { createGeoJSONCircle } from "@/lib/mapUtils/getNearestNode";
import LocationsInput from "@/components/inputs/LocationsInput";

const MAP_STYLE = "https://api.maptiler.com/maps/9c94b982-e008-4449-bb86-d3d7e79f8f4e/style.json?key=Jn6z9F7PwQrDmuB1lfHJ";
const INITIAL_ZOOM = 13;

export default function Pathfinder() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 11.39,
    latitude: 47.27,
    zoom: INITIAL_ZOOM,
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
    transitionDuration: "auto",
  });
  const [start, setStart] = useState<GeoLocationPoint>({ lon: 11.3828488, lat: 47.2608448, id: 1, type: "node" });
  const [destination, setDestination] = useState<GeoLocationPoint>({ lon: 11.4048877, lat: 47.2717276, id: 1, type: "node" });

  const [nodes, setNodes] = useState<GeoLocationPoint[]>();
  const [ways, setWays] = useState<GeoLocationWay[]>();
  const [graph, setGraph] = useState<Graph>();

  const bound: [GeoLocationPoint, GeoLocationPoint] = [start, destination];

  useEffect(() => {
    const controller = new AbortController();
    queryStreets(bound, controller.signal).then(([nodes, ways]) => {
      setNodes(nodes);
      setWays(ways);
      setGraph(new Graph(31659813, 2963357841, nodes, ways));
    });
    return () => {
      // controller.abort();
    };
  }, [start, destination]);

  useEffect(() => {}, [graph]);

  const layers = [
    new LineLayer<Edge>({
      id: "streets-layer",
      data: graph?.getEdges(),
      getSourcePosition: (e: Edge) => [e.getStart().getLongitude(), e.getStart().getLatitude()],
      getTargetPosition: (e: Edge) => [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      getColor: [69, 53, 193],
      getWidth: 4,
    }),
    // new PolygonLayer<[Coordinates]>({
    //   id: "circle",
    //   data: createGeoJSONCircle(viewState, 4),
    //   getElevation: 10,
    //   getFillColor: [0, 0, 0],
    //   getLineColor: [255, 255, 255],
    //   getLineWidth: 20,
    //   lineWidthMinPixels: 1,
    //   pickable: true,
    // }),
  ];

  const deck = useRef<DeckGLRef>(null);
  useEffect(() => {
    function prevent(event: any) {
      event.preventDefault();
    }
    deck.current?.deck?.getCanvas()?.addEventListener("contextmenu", prevent);
    return () => {
      deck.current?.deck?.getCanvas()?.removeEventListener("contextmenu", prevent);
    };
  }, [deck]);

  const baseMap = useRef<MapRef>(null);

  const lastClick = useRef<number>(0);

  return (
    <div className="h-full">
      <div className="w-[400px] z-10 relative left-6 top-6">
        <LocationsInput start={start} destination={destination} />
      </div>
      <div onContextMenu={(e) => e.preventDefault()}>
        <DeckGL
          initialViewState={viewState}
          controller={{ doubleClickZoom: false, dragRotate: false, inertia: true }}
          layers={layers}
          onClick={(info, event) => {
            event.preventDefault();
            if (event.timeStamp - lastClick.current < 200) {
              if (!info.coordinate) return;

              if (event.leftButton) {
                setStart({
                  type: "node",
                  id: 1,
                  lon: info.coordinate[0],
                  lat: info.coordinate[1],
                });
              }
              if (event.rightButton) {
                setDestination({
                  type: "node",
                  id: 1,
                  lon: info.coordinate[0],
                  lat: info.coordinate[1],
                });
              }
            }
            lastClick.current = event.timeStamp;
          }}
          ref={deck}
        >
          <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(setViewState)} ref={baseMap}>
            <Marker latitude={start.lat} longitude={start.lon} color="#000000" />
            <Marker latitude={destination.lat} longitude={destination.lon} />
          </Map>
        </DeckGL>
      </div>
    </div>
  );
}

function getUserPosition(setViewState: Dispatch<SetStateAction<MapViewState>>) {
  navigator.geolocation.getCurrentPosition((position) => {
    setViewState({
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
      zoom: INITIAL_ZOOM,
      transitionInterpolator: new FlyToInterpolator({ speed: 2.5 }),
      transitionDuration: "auto",
    });
  });
}
