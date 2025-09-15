/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { testReverseGeocoding } from '@/utils/geocodingHelper';

interface GeocodingTesterProps {
    point?: [number, number];
    onTestComplete?: (result: any) => void;
}

/**
 * A component to test the reverse geocoding functionality
 */
export default function GeocodingTester({ 
    point = [2.294471, 48.858268], // Default to a point in Paris
    onTestComplete
}: GeocodingTesterProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleTest = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const geocodingResult = await testReverseGeocoding(point);
            setResult(geocodingResult);
            
            if (onTestComplete) {
                onTestComplete(geocodingResult);
            }
        } catch (err: any) {
            console.error('Error testing geocoding:', err);
            setError(err.message || 'Failed to test geocoding');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg mb-4">
            <h3 className="font-bold mb-2">Reverse Geocoding Tester</h3>
            
            <div className="mb-4">
                <p className="text-sm mb-1">Testing with coordinates:</p>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    [{point[0]}, {point[1]}]
                </code>
            </div>
            
            <button
                onClick={handleTest}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md ${
                    isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                {isLoading ? 'Testing...' : 'Test Reverse Geocoding'}
            </button>
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}
            
            {result && (
                <div className="mt-4">
                    <p className="font-bold mb-2">Result:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-64">
                        <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}