//radii in km
export const EQUATOR_RADIUS = 6_378.137;
export const POLE_RADIUS = 6_356.752;
export const MEDIAN_EARTH_RADIUS = 6_371;

export enum fetchError {
  NO_NODE_IN_PROXIMITY,
  ABORT,
}

export enum AnimationSpeed {
  Slow = 0.02,
  Medium = 0.1,
  Fast = 0.4,
}
