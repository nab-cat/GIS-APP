/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ReverseGeocodingOptions {
    point: {
        lat: number;
        lon: number;
    };
    boundaryCircleRadius?: number; // Default: 1
    size?: number; // Default: 10
    sources?: string[]; // Default: all sources (osm, oa, wof, gn)
    layers?: string[]; // Default: all layers
}

export interface GeocodingResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Performs reverse geocoding to get address and place information based on coordinates
 * @param options - Parameters for the reverse geocoding request
 * @returns Promise with the geocoding results
 */
export async function reverseGeocode(options: ReverseGeocodingOptions): Promise<GeocodingResult> {
    try {
        // Get API key from environment variable (this will be handled by Next.js)
        const API_KEY = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;
        
        if (!API_KEY) {
            throw new Error('OpenRouteService API key is not configured');
        }
        
        // Base URL
        const baseUrl = 'https://api.openrouteservice.org/geocode/reverse';
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('api_key', API_KEY);
        params.append('point.lon', options.point.lon.toString());
        params.append('point.lat', options.point.lat.toString());
        
        // Optional parameters
        if (options.boundaryCircleRadius) {
            params.append('boundary.circle.radius', options.boundaryCircleRadius.toString());
        }
        
        if (options.size) {
            params.append('size', options.size.toString());
        }
        
        if (options.sources && options.sources.length > 0) {
            params.append('sources', options.sources.join(','));
        }
        
        if (options.layers && options.layers.length > 0) {
            params.append('layers', options.layers.join(','));
        }
        
        // Build the complete URL
        const url = `${baseUrl}?${params.toString()}`;
        
        // Make the request
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Reverse geocoding failed: ${response.status} ${response.statusText}`, errorText);
            return {
                success: false,
                error: `API Error: ${response.status} ${response.statusText}`
            };
        }
        
        const data = await response.json();
        
        return {
            success: true,
            data: data
        };
    } catch (error: any) {
        console.error('Error in reverse geocoding:', error);
        return {
            success: false,
            error: error.message || 'Failed to perform reverse geocoding'
        };
    }
}

/**
 * Test function for reverse geocoding
 * @param point - Coordinates to test
 * @returns Promise with the geocoding test results
 */
export async function testReverseGeocoding(point: [number, number]): Promise<GeocodingResult> {
    try {
        const options: ReverseGeocodingOptions = {
            point: {
                lat: point[1],
                lon: point[0]
            },
            boundaryCircleRadius: 10,
            size: 10,
            layers: ['venue', 'street', 'locality', 'neighbourhood', 'borough', 'address'],
            sources: ['openstreetmap', 'openaddresses', 'whosonfirst', 'geonames']
        };
        
        console.log('Testing reverse geocoding with options:', options);
        const result = await reverseGeocode(options);
        
        if (result.success) {
            console.log('Reverse geocoding test succeeded:', result.data);
        } else {
            console.error('Reverse geocoding test failed:', result.error);
        }
        
        return result;
    } catch (error: any) {
        console.error('Error in reverse geocoding test:', error);
        return {
            success: false,
            error: error.message || 'Failed to test reverse geocoding'
        };
    }
}
