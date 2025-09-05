import { useState, useCallback } from 'react';
import { Route, NavigationOptions } from '@/types/navigation';
import { Location } from '@/types/location';
import { Place } from '@/types/places';
import { mapboxService } from '@/services/mapboxService';

interface UseDirectionsReturn {
  userARoute: Route | null;
  userBRoute: Route | null;
  isLoading: boolean;
  error: string | null;
  getDirections: (
    userALocation: Location,
    userBLocation: Location,
    meetingSpot: Place,
    options?: NavigationOptions
  ) => Promise<void>;
  clearDirections: () => void;
}

export const useDirections = (): UseDirectionsReturn => {
  const [userARoute, setUserARoute] = useState<Route | null>(null);
  const [userBRoute, setUserBRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirections = useCallback(async (
    userALocation: Location,
    userBLocation: Location,
    meetingSpot: Place,
    options: NavigationOptions = { profile: 'driving' }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const meetingSpotCoords: [number, number] = [
        meetingSpot.coordinates.lng,
        meetingSpot.coordinates.lat,
      ];

      // Get directions for both users in parallel
      const [routeA, routeB] = await Promise.all([
        mapboxService.getDirections(
          [userALocation.coordinates.lng, userALocation.coordinates.lat],
          meetingSpotCoords,
          options
        ),
        mapboxService.getDirections(
          [userBLocation.coordinates.lng, userBLocation.coordinates.lat],
          meetingSpotCoords,
          options
        ),
      ]);

      setUserARoute(routeA);
      setUserBRoute(routeB);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDirections = useCallback(() => {
    setUserARoute(null);
    setUserBRoute(null);
    setError(null);
  }, []);

  return {
    userARoute,
    userBRoute,
    isLoading,
    error,
    getDirections,
    clearDirections,
  };
};
