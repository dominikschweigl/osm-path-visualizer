/**
 *
 * @param distance of two points in km
 * @returns
 */
export default function getMapZoomForDistance(distance: number) {
  let zoom: number;

  if (distance < 2) {
    zoom = 13;
  } else if (distance < 10) {
    zoom = 12;
  } else if (distance < 25) {
    zoom = 11;
  } else if (distance < 50) {
    zoom = 10;
  } else if (distance < 90) {
    zoom = 9;
  } else if (distance < 150) {
    zoom = 8;
  } else if (distance < 250) {
    zoom = 7;
  } else if (distance < 500) {
    zoom = 6;
  } else if (distance < 1000) {
    zoom = 5;
  } else if (distance < 2000) {
    zoom = 4;
  } else if (distance < 5000) {
    zoom = 3;
  } else {
    zoom = 2;
  }

  return zoom;
}
