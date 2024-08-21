import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AnimationSpeed } from "@/lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import Graph from "@/lib/datastructures/graph/Graph";

interface UsePathfindingAnimationProps {
  graph: Graph | null;
  start: MapLocation | null;
  destination: MapLocation | null;
}

interface UsePathfindingAnimationResult {
  searchLayerTime: number;
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
  maxTime: number;
  isAnimationPlaying: boolean;
  animationSpeed: AnimationSpeed;
  setAnimationSpeed: Dispatch<SetStateAction<AnimationSpeed>>;
  retractSearchPaths: boolean;
  setRetractSearchPaths: Dispatch<SetStateAction<boolean>>;
  animation: {
    play: () => void;
    pause: () => void;
    reset: () => void;
    restart: () => void;
    finish: () => void;
  };
}

export default function usePathfindingAnimation({ graph, start, destination }: UsePathfindingAnimationProps): UsePathfindingAnimationResult {
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(AnimationSpeed.Medium);
  const [retractSearchPaths, setRetractSearchPaths] = useState<boolean>(true);

  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [time, setTime] = useState<number>(0);

  const maxTime = graph ? graph.getSource().getTrackBackVisitTime() + (retractSearchPaths ? graph.getDestination().getSearchVisitTime() : 0) : 0;

  useEffect(() => {
    if (!isAnimationPlaying || !graph || !start || !destination) {
      setIsAnimationPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      const isSmallDistance = distanceBetweenNodes(start.geoLocation, destination.geoLocation) < 2 ? 2 : 0;
      setTime((prev) => Math.min(maxTime, prev + Math.pow(distanceBetweenNodes(start.geoLocation, destination.geoLocation), 2) * animationSpeed + isSmallDistance));

      if (time >= maxTime) {
        clearInterval(interval);
        setIsAnimationPlaying(false);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [time, isAnimationPlaying, graph]);

  useEffect(() => {
    setTime(Math.min(time, maxTime));
    if (0 < time && time < maxTime) {
      setIsAnimationPlaying(true);
    }
  }, [retractSearchPaths]);

  return {
    searchLayerTime: graph && time <= graph.getSource().getTrackBackVisitTime() ? time : maxTime - time,
    time: time,
    setTime: setTime,
    maxTime: maxTime,
    isAnimationPlaying: isAnimationPlaying,
    animationSpeed: animationSpeed,
    setAnimationSpeed: setAnimationSpeed,
    retractSearchPaths: retractSearchPaths,
    setRetractSearchPaths: setRetractSearchPaths,
    animation: {
      play: () => {
        /* if (time < maxTime)*/ setIsAnimationPlaying(true);
      },
      pause: () => setIsAnimationPlaying(false),
      reset: () => {
        setTime(0), setIsAnimationPlaying(false);
      },
      restart: () => {
        setTime(0), setIsAnimationPlaying(true);
      },
      finish: () => setTime(maxTime),
    },
  };
}
