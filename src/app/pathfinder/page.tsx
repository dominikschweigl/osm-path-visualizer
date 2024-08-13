"use client";
import Map, { Marker, MapRef, MapStyle, Popup } from "react-map-gl/maplibre";
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
import { fetchError } from "@/lib/errors";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";

import * as maptiler from "@maptiler/sdk";
import { Pathfinder } from "@/lib/pathFindingAlgorithms/interface";
import AStarPathfinder from "@/lib/pathFindingAlgorithms/AStarPathFinder";
import { Slider } from "@/components/ui/slider";

const MAP_STYLE = maptiler.MapStyle.STREETS.LIGHT.getExpandedStyleURL().concat("?key=Jn6z9F7PwQrDmuB1lfHJ");
const INITIAL_ZOOM = 13;

const SEARCH_RADIUS = 10;

export default function PathfindingVisualizer() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 11.39,
    latitude: 47.27,
    zoom: INITIAL_ZOOM,
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
    transitionDuration: "auto",
  });
  const [start, setStart] = useState<MapLocation | null>(null);
  const [destination, setDestination] = useState<MapLocation | null>(null);

  const [graph, setGraph] = useState<Graph>();
  const [pathfinder, setPathfinder] = useState<Pathfinder>();
  const [searchPaths, setSearchPaths] = useState<Edge[]>([]);
  const [shortestPath, setShortestPath] = useState<Edge[]>([]);

  const [time, setTime] = useState<number>(0);

  const bound: BoundingBox | null = start && getBoundingBoxFromPolygon(createGeoJSONCircle(start.geoLocation, SEARCH_RADIUS));

  const [searchStarted, setSearchStarted] = useState(false);
  const [shortestPathTrackStarted, setShortestPathTrackStarted] = useState(false);

  const [pathfindingAlgorithm, setPathfindingAlgorithm] = useState<PathfindingAlgorithm>("a*");

  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>("medium");

  useEffect(() => {
    if (!searchStarted || !pathfinder) {
      return;
    }

    while (!pathfinder.nextSearchStep(setSearchPaths));
  }, [searchStarted]);

  useEffect(() => {
    if (!searchStarted || !graph || !start || !destination) {
      setSearchStarted(false);
      return;
    }

    const interval = setInterval(() => {
      setTime((prev) => prev + Math.pow(distanceBetweenNodes(start.geoLocation, destination.geoLocation), 2) * 0.1 + 1); //time for animation to reach destination

      if (time >= graph.getNode(destination.geoLocation.id).getVisitTime()) {
        setShortestPathTrackStarted(true);
        setSearchStarted(false);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [searchStarted, time]);

  useEffect(() => {
    if (!shortestPathTrackStarted) return;

    const interval = setInterval(() => {
      if (!pathfinder) {
        clearInterval(interval);
        return;
      }
      const startFound = pathfinder.nextTrackBackPathStep(setShortestPath);
      if (startFound) {
        clearInterval(interval);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [shortestPathTrackStarted]);

  useEffect(() => {
    setSearchPaths([]);
    setShortestPath([]);
    setSearchStarted(false);
    setShortestPathTrackStarted(false);
    setTime(0);

    if (!start || !destination) return;

    const controller = new AbortController();
    queryStreets(bound!, controller.signal)
      .then(([nodes, ways]) => {
        const newGraph = new Graph(
          new Node(start.geoLocation.id, start.geoLocation.lat, start.geoLocation.lon),
          new Node(destination.geoLocation.id, destination.geoLocation.lat, destination.geoLocation.lon),
          nodes,
          ways
        );
        setGraph(newGraph);
        setPathfinder(pathfindingAlgorithm === "a*" ? new AStarPathfinder(newGraph) : new DijkstraPathFinder(newGraph));
      })
      .catch(() => {});

    return () => {
      controller.abort(fetchError.ABORT);
    };
  }, [start, destination]);

  useEffect(() => {
    if (!graph) return;
    setPathfinder(pathfindingAlgorithm == "a*" ? new AStarPathfinder(graph) : new DijkstraPathFinder(graph));
  }, [pathfindingAlgorithm]);

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
        return [Math.fround(e.getStart().getVisitTime()), Math.fround(e.getEnd().getVisitTime())];
      },
      currentTime: time,
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
      getColor: [13, 131, 252],
      fadeTrail: false,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 4,
    }),
    new PolygonLayer<Coordinates[]>({
      id: "circle",
      data: start ? [createGeoJSONCircle(start.geoLocation, SEARCH_RADIUS)] : [],
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

  const lastClick = useRef<number>(0);

  const previousClickAbortController = useRef<AbortController | null>(null);

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0">
        <form className="grid w-full items-start gap-6">
          <LocationsInput
            start={start}
            setStart={setStart}
            destination={destination}
            setDestination={setDestination}
            setViewState={setViewState}
            setSearchStarted={setSearchStarted}
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
                          <span className="font-medium text-foreground">Djisktra's</span> Algorithm
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
              <Select value={animationSpeed} onValueChange={(s: AnimationSpeed) => setAnimationSpeed(s)}>
                <SelectTrigger id="animationSpeed" className="items-start [&_[data-description]]:hidden">
                  <SelectValue placeholder="Select an animation speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Rabbit className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Fast</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Well suited for large distances ~ 100km
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Bird className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Medium</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Works best for medium distances ~ 10km
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="fast">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Turtle className="size-5" />
                      <div className="grid gap-0.5">
                        <p>
                          <span className="font-medium text-foreground">Slow</span> Simulation
                        </p>
                        <p className="text-xs" data-description>
                          Great for analyzing the search algorithm ~ 3km
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="animationTime">Animation Time</Label>
              <Slider
                id={"animationTime"}
                max={graph && destination ? graph?.getNode(destination.geoLocation.id)?.getVisitTime() : 100}
                min={0}
                step={0.1}
                value={[time]}
                onValueChange={([time]) => setTime(time)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="top-p">Search Radius</Label>
                <Input id="top-p" type="number" placeholder="0.7" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="top-k">Top K</Label>
                <Input id="top-k" type="number" placeholder="0.0" />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-3 overflow-hidden border ">
        <Badge variant="outline" className="absolute right-3 top-3 bg-white z-10">
          Output
        </Badge>
        <div ref={deck} onContextMenu={(e) => e.preventDefault()}>
          <DeckGL
            initialViewState={viewState}
            controller={{ doubleClickZoom: false, dragRotate: true, inertia: true }}
            layers={layers}
            onClick={(info, event) => {
              handleMapClick(info, event, setStart, setDestination, lastClick, previousClickAbortController);
            }}
          >
            <Map mapStyle={MAP_STYLE} onLoad={() => getUserPosition(INITIAL_ZOOM, setViewState)} locale={"en"}>
              {start !== null && <Marker latitude={start.geoLocation.lat} longitude={start.geoLocation.lon} color="#000" />}
              {destination !== null && <Marker latitude={destination.geoLocation.lat} longitude={destination.geoLocation.lon} color="#000" />}
            </Map>
          </DeckGL>
        </div>
      </div>
    </main>
  );
}
