import { useState, useCallback } from 'react';
import { IsochroneData, IsochroneOptions, OverlapArea } from '@/types/isochrone';
import { Location } from '@/types/location';
import { mapboxService } from '@/services/mapboxService';

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
  // This is a simplified implementation
  // In a real application, you'd use a proper geometric library like Turf.js
  // to calculate the intersection of polygons
  
  if (isochroneA.features.length === 0 || isochroneB.features.length === 0) {
    return null;
  }

  // For now, we'll create a simple overlap area based on the largest polygons
  const polygonA = isochroneA.features[isochroneA.features.length - 1]; // Largest polygon
  const polygonB = isochroneB.features[isochroneB.features.length - 1]; // Largest polygon

  // This is a placeholder - you'd implement proper polygon intersection here
  // For now, we'll return a simple overlap area
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: polygonA.geometry.coordinates, // This should be the intersection
    },
    properties: {
      area: 0, // Calculate actual area
      travelTime: polygonA.properties.contour,
      userA: locationA.id,
      userB: locationB.id,
    },
  };
}
