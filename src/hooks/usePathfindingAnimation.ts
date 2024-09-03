import { useEffect, useState } from "react";
import { AnimationSpeed } from "@/lib/constants";
import distanceBetweenNodes from "@/lib/mapUtils/distanceBetweenNodes";
import Graph from "@/lib/datastructures/graph/Graph";
import { PathfindingAnimation } from "@/lib/types";

interface UsePathfindingAnimationProps {
  graph: Graph | null;
}

export default function usePathfindingAnimation({ graph }: UsePathfindingAnimationProps): PathfindingAnimation {
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(AnimationSpeed.Medium);
  const [retractSearchPaths, setRetractSearchPaths] = useState<boolean>(true);

  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [time, setTime] = useState<number>(0);

  const maxTime = graph ? graph.getSource().getTrackBackVisitTime() + (retractSearchPaths ? graph.getDestination().getSearchVisitTime() : 0) : Number.MAX_VALUE;

  useEffect(() => {
    if (!isAnimationPlaying || !graph) {
      setIsAnimationPlaying(false);
      return;
    }
    const start = graph.getSource().getGeoLocation();
    const destination = graph.getDestination().getGeoLocation();

    const interval = setInterval(() => {
      const isSmallDistance = distanceBetweenNodes(start, destination) < 2 ? 2 : 0;

      setTime((prev) => {
        const next = Math.floor(prev + Math.pow(distanceBetweenNodes(start, destination), 2) * animationSpeed + isSmallDistance);

        if (prev < graph.getDestination().getSearchVisitTime()) {
          return Math.min(maxTime, graph.getCurrentSearchTime(), next);
        } else {
          return Math.min(maxTime, next);
        }
      });

      if (time === maxTime) {
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
    searchLayerTime: graph ? (time <= graph.getSource().getTrackBackVisitTime() ? time : maxTime - time) : 0,
    time: time,
    setTime: setTime,
    maxTime: maxTime,
    isAnimationPlaying: isAnimationPlaying,
    animationSpeed: animationSpeed,
    setAnimationSpeed: setAnimationSpeed,
    retractSearchPaths: retractSearchPaths,
    setRetractSearchPaths: setRetractSearchPaths,
    controls: {
      play: () => setIsAnimationPlaying(true),
      pause: () => setIsAnimationPlaying(false),
      reset: () => {
        setTime(0), setIsAnimationPlaying(false);
      },
      restart: () => {
        setTime(0), setIsAnimationPlaying(true);
      },
      finish: () => setTime(maxTime < Number.MAX_VALUE ? maxTime : time),
    },
  };
}
