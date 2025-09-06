import { LocationSearchResult } from '@/types/location';
import { IsochroneData, IsochroneOptions } from '@/types/isochrone';
import { Place, PlaceSearchOptions } from '@/types/places';
import { Route, NavigationOptions } from '@/types/navigation';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is required');
}

class MapboxService {
  private baseUrl = 'https://api.mapbox.com';

  private async makeRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add access token
    params.access_token = MAPBOX_ACCESS_TOKEN!;
    
    // Add all parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log('Making request to:', url.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mapbox API error:', response.status, response.statusText, errorText);
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Geocoding API
  async searchLocation(query: string, limit: number = 5): Promise<LocationSearchResult[]> {
    const params = {
      types: 'place,locality,neighborhood,address,poi',
      limit: limit.toString(),
      autocomplete: 'true',
      country: 'ID', // Indonesia
    };

    const response = await this.makeRequest<{
      features: Array<{
        id: string;
        place_name: string;
        center: [number, number];
        address?: string;
        category?: string;
        relevance?: number;
      }>;
    }>(`/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, params);

    return response.features.map(feature => ({
      id: feature.id,
      place_name: feature.place_name,
      center: feature.center,
      address: feature.address,
      category: feature.category,
      relevance: feature.relevance,
    }));
  }

  async reverseGeocode(lng: number, lat: number): Promise<string> {
    const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,poi,place`
    );
    
    if (!response.ok) {
        throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
    }
    
    return '';
}

  // Isochrone API
  async getIsochrone(
    coordinates: [number, number],
    options: IsochroneOptions
  ): Promise<IsochroneData> {
    // Validate coordinates
    const [lng, lat] = coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error(`Invalid coordinates: longitude must be between -180 and 180, latitude between -90 and 90. Got: ${lng}, ${lat}`);
    }

    // Validate and filter minutes to be between 1-60
    const validMinutes = options.minutes.filter(min => min >= 1 && min <= 60);
    
    if (validMinutes.length === 0) {
      throw new Error('At least one valid minute value (1-60) is required');
    }

    const params: Record<string, string> = {
      contours_minutes: validMinutes.join(','),
    };

    // Add optional parameters only if they have valid values
    if (options.polygons) {
      params.polygons = 'true';
    }
    
    if (options.denoise !== undefined && options.denoise >= 0 && options.denoise <= 1) {
      params.denoise = options.denoise.toString();
    }
    
    if (options.generalize !== undefined && options.generalize >= 0) {
      params.generalize = options.generalize.toString();
    }

    console.log('Isochrone API call:', {
      endpoint: `/isochrone/v1/mapbox/${options.profile}/${coordinates[0]},${coordinates[1]}`,
      params,
      coordinates,
      options
    });

    return this.makeRequest<IsochroneData>(
      `/isochrone/v1/mapbox/${options.profile}/${coordinates[0]},${coordinates[1]}`,
      params
    );
  }

  // Places API (using Geocoding API with POI types)
  async searchPlaces(
    coordinates: [number, number],
    options: PlaceSearchOptions = {}
  ): Promise<Place[]> {
    // Use a more generic search approach - search for common place types
    const searchQueries = options.category ? [options.category] : ['restaurant', 'cafe', 'shop', 'gas', 'bank'];
    const allPlaces: Place[] = [];

    for (const searchQuery of searchQueries) {
      try {
        const params = {
          types: 'poi',
          limit: '5', // Limit per query
          proximity: `${coordinates[0]},${coordinates[1]}`,
        };

        console.log(`Searching for ${searchQuery} near ${coordinates[0]}, ${coordinates[1]}`);

        const response = await this.makeRequest<{
          features: Array<{
            id: string;
            text: string;
            place_name: string;
            center: [number, number];
            properties?: {
              category?: string;
              maki?: string;
            };
            context?: Array<{
              text: string;
            }>;
          }>;
        }>(`/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`, params);

        console.log(`Found ${response.features.length} places for ${searchQuery}:`, response.features);

        const places = response.features.map(feature => ({
          id: feature.id,
          name: feature.text || feature.place_name.split(',')[0],
          category: feature.properties?.category || searchQuery,
          coordinates: {
            lng: feature.center[0],
            lat: feature.center[1],
          },
          address: feature.place_name,
          distance: this.calculateDistance(
            coordinates,
            feature.center
          ),
        }));

        allPlaces.push(...places);
      } catch (error) {
        console.warn(`Failed to search for ${searchQuery}:`, error);
        // Continue with other searches
      }
    }

    // Remove duplicates and limit results
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.id === place.id)
    );

    console.log(`Total unique places found: ${uniquePlaces.length}`);
    return uniquePlaces.slice(0, options.limit || 20);
  }

  // Directions API
  async getDirections(
    start: [number, number],
    end: [number, number],
    options: NavigationOptions = { profile: 'driving' }
  ): Promise<Route> {
    const params = {
      profile: options.profile || 'driving',
      alternatives: options.alternatives ? 'true' : 'false',
      steps: options.steps ? 'true' : 'false',
      geometries: options.geometries || 'geojson',
      overview: options.overview || 'full',
    };

    const response = await this.makeRequest<{
      routes: Array<{
        distance: number;
        duration: number;
        geometry: {
          type: 'LineString';
          coordinates: number[][];
        };
        legs: Array<{
          distance: number;
          duration: number;
          steps: Array<{
            distance: number;
            duration: number;
            instruction: string;
            maneuver: {
              type: string;
              location: [number, number];
              bearing_before: number;
              bearing_after: number;
            };
            geometry: {
              type: 'LineString';
              coordinates: number[][];
            };
          }>;
          summary: string;
        }>;
      }>;
      waypoints: Array<{
        coordinates: [number, number];
        name: string;
        waypoint_index: number;
      }>;
    }>(`/directions/v5/mapbox/${params.profile}/${start[0]},${start[1]};${end[0]},${end[1]}`, params);

    if (response.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = response.routes[0];
    return {
      id: `route-${Date.now()}`,
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      legs: route.legs,
      waypoints: response.waypoints,
    };
  }

  // Matrix API for distance/time calculations
  async getMatrix(
    coordinates: [number, number][],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<{
    durations: number[][];
    distances: number[][];
  }> {
    const coordsString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
    
    const params = {
      sources: '0',
      destinations: '1',
      annotations: 'duration,distance',
    };

    const response = await this.makeRequest<{
      durations: number[][];
      distances: number[][];
    }>(`/matrix/v1/mapbox/${profile}/${coordsString}`, params);

    return response;
  }

  // Utility function to calculate distance between two points
  private calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1[1] * Math.PI) / 180;
    const φ2 = (point2[1] * Math.PI) / 180;
    const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180;
    const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const mapboxService = new MapboxService();
