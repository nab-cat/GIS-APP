import { useState } from 'react';
import { mapboxService } from '@/services/mapboxService';

export default function IsochroneTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testIsochrone = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with Jakarta coordinates
      const coordinates: [number, number] = [106.8171264, -6.258688];
      const options = {
        profile: 'driving' as const,
        minutes: [10], // Start with just one value
        polygons: true,
      };

      console.log('Testing isochrone with:', { coordinates, options });
      const data = await mapboxService.getIsochrone(coordinates, options);
      setResult(data);
      console.log('Isochrone result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Isochrone test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testIsochroneMinimal = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with minimal parameters
      const coordinates: [number, number] = [106.8171264, -6.258688];
      const options = {
        profile: 'driving' as const,
        minutes: [10],
        // No other parameters
      };

      console.log('Testing minimal isochrone with:', { coordinates, options });
      const data = await mapboxService.getIsochrone(coordinates, options);
      setResult(data);
      console.log('Minimal isochrone result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Minimal isochrone test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testPlaces = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with Jakarta coordinates
      const coordinates: [number, number] = [106.8171264, -6.258688];
      const options = {
        // Don't specify category to test multiple searches
        limit: 10,
      };

      console.log('Testing places with:', { coordinates, options });
      const data = await mapboxService.searchPlaces(coordinates, options);
      setResult(data);
      console.log('Places result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Places test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testPlacesSpecific = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with Jakarta coordinates and specific category
      const coordinates: [number, number] = [106.8171264, -6.258688];
      const options = {
        category: 'restaurant',
        limit: 5,
      };

      console.log('Testing specific places with:', { coordinates, options });
      const data = await mapboxService.searchPlaces(coordinates, options);
      setResult(data);
      console.log('Specific places result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Specific places test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testIsochroneMinimal}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Testing...' : 'Minimal Test'}
          </button>
          
          <button
            onClick={testIsochrone}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Testing...' : 'Full Test'}
          </button>
          
          <button
            onClick={testPlaces}
            disabled={isLoading}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Testing...' : 'Places Test'}
          </button>
          
          <button
            onClick={testPlacesSpecific}
            disabled={isLoading}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Testing...' : 'Restaurant Test'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Result:</h4>
          <pre className="text-xs text-green-700 dark:text-green-300 overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
