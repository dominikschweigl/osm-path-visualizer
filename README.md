# [Open Street Map Pathfinding Visualizer](https://dominikschweigl.github.io/osm-path-visualizer/)
This is a pathfinding visualizer that I made while learning common pathfinding algorithms like Dijkstra's, A*, and Greedy Best First Search. Below you can find some design decisions that went into making this project.

https://github.com/user-attachments/assets/c8e2406a-e0de-4304-83c0-1c5ab3d8f13f

## Table of contents
* [Data preparation](#data-preparation)
* [Loading the graph](#loading-the-graph)
* [Rendering](#rendering)
* [Pathfinding](#pathfinding)
* [Developing locally](#developing-locally)
<br/><br/>

## Data preparation
Data generated and stored in this repository comes from www.openstreetmap.org
(available under the [ODbL](https://opendatacommons.org/licenses/odbl/) license).

[Overpass API]([https://extract.bbbike.org/](https://wiki.openstreetmap.org/wiki/Overpass_API)) was used to extract regional data as an array of nodes. This data was then turned into an undirected graph data structure. In the graph, roads are not distinguished. The graph consists of nodes that have edges to neighboring nodes. An adjacency map per node keeps track of directly-connected neighboring nodes.
```json
{
  "id": 973778633,
  "latitude": 47.2783306,
  "longitude": 10.9686572,
  "edges": {},
  "distance": 0,
  "searchVisitTime": 0,
  "trackBackVisitTime": 1.7976931348623157e+308,
  "isInsideSeenArea": false
  "type": "graph-node",
}
```


## Loading the graph
Since the data for a pathfinding search can be very large (potentially the whole open street map), loading the data needed to be done on-demand. 

The world map was tiled up depending on the distance of start and destination. The Tile side length generally is 1/4 of the distance between start and destination with a minimum of 30km. Each node has a property isInsideSeenArea which tells us if we have loaded the tile that this node is contained in. If the next node in the search queue does not have a loaded search tile the tile will be fetched with the overpass API.
```typescript
export async function queryStreets(boundingBox, signal) {
  const streetQuery = `
    [out:json][bbox: ${boundingBox.bottom},${boundingBox.left},${boundingBox.top},${boundingBox.right}];
    (
    way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|residential|unclassified|living_street)$"];
    >;
    );
    out skel qt;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: streetQuery,
    signal: signal,
  });

  if (!res.ok) return Promise.reject();

  const data = await res.json();
  const elements: (GeoLocationPoint | GeoLocationWay)[] = data.elements;

  const nodes: GeoLocationPoint[] = [];
  const ways: GeoLocationWay[] = [];

  for (const element of elements) {
    if (element.type === "node") {
      nodes.push({ type: "node", id: element.id, lat: element.lat, lon: element.lon });
    }
    if (element.type === "way") {
      ways.push({ type: "way", id: element.id, nodes: element.nodes });
    }
  }

  return [nodes, ways];
}
```

## Rendering
To draw the map, [React Map GL](https://visgl.github.io/react-map-gl/) and [Deck GL](https://deck.gl/) was used. [Maptiler]([https://carto.com/help/building-maps/basemap-list/](https://www.maptiler.com/)) tiles were used in the styling of the map.

To visualize pathfinding progress, visited nodes needed to be drawn on the screen. However, at the same time, we cannot create a new trips layer everytime we add a node - that would be impossibly slow. The workaround was to set a searchTime on each node during our pathfinding algorithm and increment the time property of our trip layer indepentendly of our underlying data. This way we only need to update our trip layer we load a new search tile which can be done while waiting for our open street map data to finish fetching.

## Pathfinding
Currently, these pathfinding algorithms are supported
- **Dijkstra**: Optimized breadth-first search that prioritizes exploring lower-cost paths.
    - *(weighted, shortest path guaranteed)*
- **A\***: Optimized Dijkstra for when we know end node location. Uses lat/long distance as heuristic.
    - *(weighted, shortest path guaranteed)*

**Weighted vs Unweighted**  
You'll notice that some of the algorithms listed above are weighted, while others are unweighted.

The weighted algorithms use the [Euclidian distance]([https://en.wiktionary.org/wiki/Manhattan_distance](https://en.wikipedia.org/wiki/Euclidean_distance)) heuristic, which calculates the sum of horizontal and vertical (read: lateral and longitudinal) distances between two nodes and takes the square root. In other words, the shortest path will have the least *physical distance* between the two nodes.

Unweighted algorithms give all edges the same weight of 1. In other words, the shortest path will have the least amount of nodes.

## Developing locally
If you'd like to play around with the code:
```bash
# install dependencies
npm install

# serve with hot reload at localhost
npm run dev

# building for production
npm run build
```
