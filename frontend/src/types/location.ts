export interface Location {
  id: string;
  name: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  address?: string;
  type: 'current' | 'manual' | 'search';
  accuracy?: number; // in meters for geolocation
  timestamp: number;
}

export interface LocationSearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  address?: string;
  category?: string;
  relevance?: number;
}

export interface LocationFormData {
  searchQuery: string;
  selectedLocation: Location | null;
  isGeolocating: boolean;
  error: string | null;
}
