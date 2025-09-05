export interface Place {
  id: string;
  name: string;
  category: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  address: string;
  distance?: number; // from overlap center
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  photos?: string[];
  description?: string;
  openingHours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  phone?: string;
  website?: string;
}

export interface PlaceSearchOptions {
  category?: string;
  radius?: number; // in meters
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'relevance';
}

export interface PlaceCategory {
  id: string;
  name: string;
  icon: string;
  mapboxCategory?: string;
}
