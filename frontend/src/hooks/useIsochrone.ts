import { useState, useCallback } from 'react';
import { IsochroneData, IsochroneOptions, OverlapArea } from '@/types/isochrone';
import { Location } from '@/types/location';
import { mapboxService } from '@/services/mapboxService';
import polygonClipping from 'polygon-clipping';

interface UseIsochroneReturn {
  userAIsochrone: IsochroneData | null;
  userBIsochrone: IsochroneData | null;
  overlapArea: OverlapArea | null;
  isLoading: boolean;
  error: string | null;
  generateIsochrones: (
    userALocation: Location,
    userBLocation: Location,
    options: IsochroneOptions
  ) => Promise<void>;
  clearIsochrones: () => void;
}

export const useIsochrone = (): UseIsochroneReturn => {
  const [userAIsochrone, setUserAIsochrone] = useState<IsochroneData | null>(null);
  const [userBIsochrone, setUserBIsochrone] = useState<IsochroneData | null>(null);
  const [overlapArea, setOverlapArea] = useState<OverlapArea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateIsochrones = useCallback(async (
    userALocation: Location,
    userBLocation: Location,
    options: IsochroneOptions
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating isochrones with options:', options);
      console.log('User A location:', userALocation.coordinates);
      console.log('User B location:', userBLocation.coordinates);

      // Generate isochrones for both users in parallel
      const [userAData, userBData] = await Promise.all([
        mapboxService.getIsochrone(
          [userALocation.coordinates.lng, userALocation.coordinates.lat],
          options
        ),
        mapboxService.getIsochrone(
          [userBLocation.coordinates.lng, userBLocation.coordinates.lat],
          options
        ),
      ]);

      console.log('User A isochrone data:', userAData);
      console.log('User B isochrone data:', userBData);

      setUserAIsochrone(userAData);
      setUserBIsochrone(userBData);

      // Calculate overlap area
      const overlap = calculateOverlapArea(userAData, userBData, userALocation, userBLocation);
      setOverlapArea(overlap);
    } catch (err) {
      console.error('Isochrone generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate isochrones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearIsochrones = useCallback(() => {
    setUserAIsochrone(null);
    setUserBIsochrone(null);
    setOverlapArea(null);
    setError(null);
  }, []);

  return {
    userAIsochrone,
    userBIsochrone,
    overlapArea,
    isLoading,
    error,
    generateIsochrones,
    clearIsochrones,
  };
};

// Helper function to calculate overlap area between two isochrones
function calculateOverlapArea(
  isochroneA: IsochroneData,
  isochroneB: IsochroneData,
  locationA: Location,
  locationB: Location
): OverlapArea | null {
  if (isochroneA.features.length === 0 || isochroneB.features.length === 0) {
    console.log('One or both isochrones have no features');
    return null;
  }

  try {
    // Get the largest polygon from each isochrone
    const polygonA = isochroneA.features[isochroneA.features.length - 1];
    const polygonB = isochroneB.features[isochroneB.features.length - 1];

    // Extract coordinates for polygon-clipping format (it expects different structure than GeoJSON)
    const coordsA = polygonA.geometry.coordinates;
    const coordsB = polygonB.geometry.coordinates;

    // Calculate intersection
    const intersection = polygonClipping.intersection(coordsA, coordsB);

    if (!intersection || intersection.length === 0 || intersection[0].length === 0) {
      console.log('No intersection found between isochrones');
      return null;
    }

    // Calculate area using simple formula (approximate for small areas)
    const area = calculatePolygonArea(intersection[0][0]);
    
    // Return as GeoJSON feature
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: intersection[0]
      },
      properties: {
        area: parseFloat((area / 1000000).toFixed(2)), // Convert to km²
        travelTime: Math.max(polygonA.properties.contour, polygonB.properties.contour),
        userA: locationA.id,
        userB: locationB.id,
      },
    };
  } catch (error) {
    console.error('Error calculating intersection:', error);
    return null;
  }
}

// Simple function to calculate polygon area (in square meters)
function calculatePolygonArea(coords: number[][]): number {
  let area = 0;
  
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  
  // Close the polygon
  const [x1, y1] = coords[coords.length - 1];
  const [x2, y2] = coords[0];
  area += x1 * y2 - x2 * y1;
  
  // Convert to square meters (approximate for small areas)
  return Math.abs(area) * 0.5 * 111000 * 111000;
}
