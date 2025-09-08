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
      console.log('Getting directions with options:', {
        userALocation,
        userBLocation,
        meetingSpot,
        options
      });

      const userACoords: [number, number] = [
        userALocation.coordinates.lng,
        userALocation.coordinates.lat
      ];

      const userBCoords: [number, number] = [
        userBLocation.coordinates.lng,
        userBLocation.coordinates.lat
      ];

      const meetingSpotCoords: [number, number] = [
        meetingSpot.coordinates.lng,
        meetingSpot.coordinates.lat
      ];

      // Ensure coordinates are valid numbers
      if (isNaN(userACoords[0]) || isNaN(userACoords[1]) ||
          isNaN(userBCoords[0]) || isNaN(userBCoords[1]) ||
          isNaN(meetingSpotCoords[0]) || isNaN(meetingSpotCoords[1])) {
        throw new Error('Invalid coordinates for directions');
      }

      console.log('Direction coordinates:', {
        userA: userACoords,
        userB: userBCoords,
        meeting: meetingSpotCoords
      });

      // Get directions for both users in parallel
      const [routeA, routeB] = await Promise.all([
        mapboxService.getDirections(
          userACoords,
          meetingSpotCoords,
          options
        ),
        mapboxService.getDirections(
          userBCoords,
          meetingSpotCoords,
          options
        ),
      ]);

      setUserARoute(routeA);
      setUserBRoute(routeB);
    } catch (err) {
      console.error('Error getting directions:', err);
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
