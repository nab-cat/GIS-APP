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
      
      console.log('Searching places for overlap area:', overlapArea);
      console.log('Center point:', center);
      console.log('Search options:', options);
      
      // Search for places within the overlap area
      const foundPlaces = await mapboxService.searchPlaces(
        [center[0], center[1]],
        {
          ...options,
          radius: options.radius || 1000, // 1km radius
        }
      );

      console.log('Found places:', foundPlaces);

      // Filter places that are actually within the overlap area
      const placesInOverlap = foundPlaces.filter(place => 
        isPointInPolygon(
          [place.coordinates.lng, place.coordinates.lat],
          overlapArea.geometry.coordinates[0]
        )
      );

      console.log('Places in overlap:', placesInOverlap);

      // Sort by distance if specified
      if (options.sortBy === 'distance') {
        placesInOverlap.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setPlaces(placesInOverlap);
      console.log('usePlacesSearch: Search completed, places set:', placesInOverlap.length);
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
