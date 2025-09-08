import { useState, useCallback } from 'react';
import { Place, PlaceSearchOptions } from '@/types/places';
import { OverlapArea } from '@/types/isochrone';
import { mapboxService } from '@/services/mapboxService';

interface UsePlacesSearchReturn {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  searchPlaces: (
    overlapArea: OverlapArea,
    options?: PlaceSearchOptions
  ) => Promise<void>;
  clearPlaces: () => void;
}

export const usePlacesSearch = (): UsePlacesSearchReturn => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (
    overlapArea: OverlapArea,
    options: PlaceSearchOptions = {}
  ) => {
    console.log('usePlacesSearch: Starting search...');
    setIsLoading(true);
    setError(null);

    try {
      // Calculate center point of overlap area
      const center = calculatePolygonCenter(overlapArea.geometry.coordinates[0]);
      
      console.log('Searching for meeting spots in overlap area:', {
        center,
        area: overlapArea.properties.area,
      });
      
      // Use Mapbox Search API for reverse geocoding
      const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/search/searchbox/v1/reverse?longitude=${center[0]}&latitude=${center[1]}&limit=10&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reverse geocoding result:', data);
      
      if (!data.features || data.features.length === 0) {
        console.log('No places found in the area');
        setPlaces([]);
        return;
      }
      
      // Transform the response to match our Place type
      const foundPlaces = data.features.map(feature => {
        const { name, place_formatted, feature_type, coordinates, mapbox_id } = feature.properties;
        
        return {
          id: mapbox_id || `place-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name || place_formatted.split(',')[0],
          category: feature_type || 'place',
          coordinates: {
            lng: coordinates.longitude,
            lat: coordinates.latitude,
          },
          address: place_formatted,
          distance: calculateDistance(
            [center[0], center[1]],
            [coordinates.longitude, coordinates.latitude]
          ),
          maki: feature.properties.maki || 'marker',
        };
      });
      
      // Filter places that are actually within the overlap area
      const placesInOverlap = foundPlaces.filter(place => 
        isPointInPolygon(
          [place.coordinates.lng, place.coordinates.lat],
          overlapArea.geometry.coordinates[0]
        )
      );

      console.log('Places in overlap area:', placesInOverlap);

      // Sort by distance
      placesInOverlap.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setPlaces(placesInOverlap);
    } catch (err) {
      console.error('Places search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search places');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  return {
    places,
    isLoading,
    error,
    searchPlaces,
    clearPlaces,
  };
};

// Helper function to calculate the center point of a polygon
function calculatePolygonCenter(coordinates: number[][]): [number, number] {
  let totalLng = 0;
  let totalLat = 0;
  
  coordinates.forEach(coord => {
    totalLng += coord[0];
    totalLat += coord[1];
  });
  
  return [totalLng / coordinates.length, totalLat / coordinates.length];
}

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Helper function to calculate distance between two points
function calculateDistance(
  point1: [number, number], 
  point2: [number, number]
): number {
  // Simple implementation of the Haversine formula
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  
  const dLat = toRad(point2[1] - point1[1]);
  const dLon = toRad(point2[0] - point1[0]);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(point1[1])) * Math.cos(toRad(point2[1])) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
