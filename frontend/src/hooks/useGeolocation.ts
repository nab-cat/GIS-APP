import { useState, useCallback } from 'react';
import { Location } from '@/types/location';
import { mapboxService } from '@/services/mapboxService';

interface UseGeolocationReturn {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { longitude, latitude, accuracy } = position.coords;
      
      // Get address using reverse geocoding
      const addressData = await mapboxService.reverseGeocode(longitude, latitude);
      
      const newLocation: Location = {
        id: `current-${Date.now()}`,
        name: addressData?.place_name || 'Current Location',
        coordinates: {
          lng: longitude,
          lat: latitude,
        },
        address: addressData?.place_name,
        type: 'current',
        accuracy,
        timestamp: Date.now(),
      };

      setLocation(newLocation);
    } catch (err) {
      let errorMessage = 'Unable to get your location';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation,
  };
};
