export interface IsochroneOptions {
  profile: 'driving' | 'walking' | 'cycling';
  minutes: number[];
  colors?: string[];
  polygons?: boolean;
  denoise?: number;
  generalize?: number;
}

export interface IsochroneData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      contour: number;
      color: string;
    };
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  }>;
}

export interface IsochroneLayer {
  id: string;
  data: IsochroneData;
  options: IsochroneOptions;
  userLocation: {
    lng: number;
    lat: number;
  };
}

export interface OverlapArea {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    area: number;
    travelTime: number;
    userA: string;
    userB: string;
  };
}
