export interface Route {
  id: string;
  distance: number; // in meters
  duration: number; // in seconds
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  legs: RouteLeg[];
  waypoints: RouteWaypoint[];
}

export interface RouteLeg {
  distance: number;
  duration: number;
  steps: RouteStep[];
  summary: string;
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  maneuver: {
    type: string;
    location: [number, number];
    bearing_before: number;
    bearing_after: number;
  };
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
}

export interface RouteWaypoint {
  coordinates: [number, number];
  name: string;
  waypoint_index: number;
}

export interface NavigationOptions {
  profile: 'driving' | 'walking' | 'cycling';
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
}
