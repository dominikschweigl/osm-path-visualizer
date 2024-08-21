"use client";

import Map, { Marker, MapRef, MapStyle, Popup, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { DeckProps } from "@deck.gl/core";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Bird,
  Book,
  Bot,
  Code2,
  CornerDownLeft,
  Crown,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Radius,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle,
} from "lucide-react";

import DijkstraPathFinder from "@/lib/pathFindingAlgorithms/DijkstraPathFinder";
import { Button } from "@/components/ui/button";
import Node from "@/lib/datastructures/graph/Node";
import { handleMapClick } from "@/lib/mapUtils/handleMapClick";
import { fetchError, AnimationSpeed } from "@/lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";

import * as maptiler from "@maptiler/sdk";
import { Pathfinder } from "@/lib/pathFindingAlgorithms/interface";
import AStarPathfinder from "@/lib/pathFindingAlgorithms/AStarPathFinder";
import { Slider } from "@/components/ui/slider";
import isWithinBoundingBox from "@/lib/mapUtils/isWithinBoundingBox";
import LoadingSpinner from "@/components/ui/spinner";
import TutorialDialog from "@/components/layouts/TutorialDialog";
import PlaybackControls from "@/components/layouts/controls/playback";
import usePathfindingAnimation from "@/hooks/usePathfindingAnimation";

const MAP_STYLE = maptiler.MapStyle.STREETS.LIGHT.getExpandedStyleURL().concat("?key=Jn6z9F7PwQrDmuB1lfHJ");
const INITIAL_ZOOM = 10;

export default function PathfindingVisualizer() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 11.39,
    latitude: 47.27,
    zoom: INITIAL_ZOOM,
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
    transitionDuration: "auto",
  });

  const [searchRadius, setSearchRadius] = useState<number>(10);

  const [start, setStart] = useState<MapLocation | null>(null);
  const [destination, setDestination] = useState<MapLocation | null>(null);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [searchPaths, setSearchPaths] = useState<Edge[]>([]);
  const [shortestPath, setShortestPath] = useState<Edge[]>([]);

  const bound: BoundingBox | null = start && getBoundingBoxFromPolygon(createGeoJSONCircle(start.geoLocation, searchRadius));

  const [pathfindingAlgorithm, setPathfindingAlgorithm] = useState<PathfindingAlgorithm>("a*");

  const { searchLayerTime, time, setTime, maxTime, isAnimationPlaying, animationSpeed, setAnimationSpeed, retractSearchPaths, setRetractSearchPaths, animation } =
    usePathfindingAnimation({
      graph,
      start,
      destination,
    });

  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setSearchPaths([]);
    setShortestPath([]);
    animation.reset();

    if (!start || !destination) return;

    const controller = new AbortController();
    setSearchLoading(true);
    queryStreets(bound!, controller.signal)
      .then(([nodes, ways]) => {
        const newGraph = new Graph(
          new Node(start.geoLocation.id, start.geoLocation.lat, start.geoLocation.lon),
          new Node(destination.geoLocation.id, destination.geoLocation.lat, destination.geoLocation.lon),
          nodes,
          ways
        );

        const pathfinder = pathfindingAlgorithm === "a*" ? new AStarPathfinder(newGraph) : new DijkstraPathFinder(newGraph);

        while (!pathfinder.nextSearchStep(setSearchPaths));
        setShortestPath(pathfinder.getShortestPath());

        setGraph(newGraph);
        animation.play();
        setSearchLoading(false);
      })
      .catch(() => {
        setSearchLoading(false);
      });

    return () => {
      setSearchLoading(false);
      controller.abort(fetchError.ABORT);
    };
  }, [start, destination, pathfindingAlgorithm]);

  useEffect(() => {
    if (!graph) return;
    setSearchPaths([]);
    setShortestPath([]);
    animation.reset();
  }, [pathfindingAlgorithm]);

  useEffect(() => {
    if (destination && bound && !isWithinBoundingBox(destination, bound)) {
      setDestination(null);
    }
  }, [searchRadius]);

  const layers = [
    // new TripsLayer<Edge>({
    //   id: "path-layer",
    //   data: graph?.getEdges(),
    //   getPath: (e) => [
    //     [e.getStart().getLongitude(), e.getStart().getLatitude()],
    //     [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
    //   ],
    //   getColor: [253, 128, 93],
    //   fadeTrail: false,
    //   capRounded: true,
    //   jointRounded: true,
    //   widthMinPixels: 2,
    // }),
    new TripsLayer<Edge>({
      id: "search-layer",
      data: searchPaths,
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      getTimestamps: (e) => {
        return [Math.fround(e.getStart().getSearchVisitTime()), Math.fround(e.getEnd().getSearchVisitTime())];
      },
      currentTime: searchLayerTime,
      getColor: [0, 0, 0],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 2,
    }),
    new TripsLayer<Edge>({
      id: "shortest-path-layer",
      data: shortestPath,
      getPath: (e) => [
        [e.getStart().getLongitude(), e.getStart().getLatitude()],
        [e.getEnd().getLongitude(), e.getEnd().getLatitude()],
      ],
      currentTime: time,
      getTimestamps: (e) => {
        return [Math.fround(e.getStart().getTrackBackVisitTime()), Math.fround(e.getEnd().getTrackBackVisitTime())];
      },
      getColor: [13, 131, 252],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 4,
    }),
    new PolygonLayer<Coordinates[]>({
      id: "circle",
      data: start ? [createGeoJSONCircle(start.geoLocation, searchRadius)] : [],
      getPolygon: (ps) => ps.map((p) => [p.lon, p.lat]),
      getElevation: 10,
      getFillColor: [0, 0, 0, 0],
      getLineColor: [0, 0, 0],
      getLineWidth: 4,
      lineWidthMinPixels: 4,
      pickable: true,
    }),
  ];

  const lastClick = useRef<number>(0);

  const previousClickAbortController = useRef<AbortController | null>(null);

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0">
        <form className="grid w-full items-start gap-6">
          <LocationsInput
            start={start}
            destination={destination}
            boundingBox={bound}
            searchLoading={searchLoading}
            searchStarted={isAnimationPlaying}
            setStart={setStart}
            setDestination={setDestination}
            setViewState={setViewState}
            setSearchLoading={setSearchLoading}
          />
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
            <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
            <div className="grid gap-3">
              <Label htmlFor="model">Search Algorithm</Label>
              <Select value={pathfindingAlgorithm} onValueChange={(v: PathfindingAlgorithm) => setPathfindingAlgorithm(v)}>
                <SelectTrigger id="model" className="items-start [&_[data-description]]:hidden">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a*">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Crown className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">A*</span> Algorithm
                        </p>
                        <p className="text-xs" data-description>
                          The optimal Algorithm to find the shortest path
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dijkstra">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Radius className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Djisktra&apos;s</span> Algorithm
                        </p>
                        <p className="text-xs" data-description>
                          The general method to find shortest paths
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="animationSpeed">Animation Speed</Label>
              <Select
                value={animationSpeed.toString()}
                onValueChange={(s) => {
                  setAnimationSpeed(+s);
                }}
              >
                <SelectTrigger id="animationSpeed" className="items-start [&_[data-description]]:hidden">
                  <SelectValue placeholder="Select an animation speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnimationSpeed.Fast.toString()}>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Rabbit className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Fast</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Well suited for large distances
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={AnimationSpeed.Medium.toString()}>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Bird className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Medium</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Works best for medium distances
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={AnimationSpeed.Slow.toString()}>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Turtle className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Slow</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Great for analyzing the search algorithm
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-col gap-4">
              <Label htmlFor="search-radius">Search Radius</Label>
              <div className="flex gap-2">
                <div className="w-[56px]">
                  <Input id="search-radius" type="text" value={searchRadius} readOnly />
                </div>
                <div className="flex gap-3 items-bottom w-full">
                  <Slider min={1} max={50} step={1} value={[searchRadius]} onValueChange={([radius]) => setSearchRadius(radius)} />
                </div>
              </div>
            </div>
          </fieldset>
          <PlaybackControls
            time={time}
            maxTime={maxTime}
            isAnimationPlaying={isAnimationPlaying}
            retractSearchPaths={retractSearchPaths}
            setRetractSearchPaths={setRetractSearchPaths}
            setTime={setTime}
            play={animation.play}
            pause={animation.pause}
            reset={animation.reset}
            restart={animation.restart}
            finish={animation.finish}
          />
        </form>
      </div>
      <div className="relative flex min-h-[50vh] flex-col rounded-lg bg-muted/50 p-4 lg:col-span-3 overflow-hidden border mt-[9px] ">
        <Badge variant="outline" className="absolute right-3 top-3 bg-white z-10">
          Output
        </Badge>
        <div onContextMenu={(e) => e.preventDefault()}>
          <DeckGL
            initialViewState={viewState}
            controller={{ doubleClickZoom: false, dragRotate: true, inertia: true }}
            onClick={(info, event) => {
              handleMapClick(info, event, setStart, setDestination, bound, lastClick, previousClickAbortController);
            }}
          >
            <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(INITIAL_ZOOM, setViewState)} locale={"en"}>
              {start !== null && <Marker latitude={start.geoLocation.lat} longitude={start.geoLocation.lon} color="#000" />}
              {destination !== null && <Marker latitude={destination.geoLocation.lat} longitude={destination.geoLocation.lon} color="#000" />}
              {
                //@ts-ignore
                <DeckGLOverlay layers={layers} interleaved />
              }
            </Map>
          </DeckGL>
        </div>
        {searchLoading && (
          <div className="absolute right-4 bottom-4">
            <LoadingSpinner size={32} />
          </div>
        )}
      </div>
    </main>
  );
}

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
