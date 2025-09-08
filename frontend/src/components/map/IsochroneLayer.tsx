/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { IsochroneData, IsochroneOptions, OverlapArea } from '@/types/isochrone';
import { Location } from '@/types/location';
import * as martinez from 'martinez-polygon-clipping';

interface IsochroneLayerProps {
  map: mapboxgl.Map;
  userAIsochrone: IsochroneData | null;
  userBIsochrone: IsochroneData | null;
  userALocation: Location | null;
  userBLocation: Location | null;
  options: IsochroneOptions;
  onOverlapAreaChange?: (overlapArea: any) => void;
}

export default function IsochroneLayer({
  map,
  userAIsochrone,
  userBIsochrone,
  userALocation,
  userBLocation,
  options,
  onOverlapAreaChange,
}: IsochroneLayerProps) {
  const layersAddedRef = useRef<Set<string>>(new Set());

  // Add isochrone layers to map
  useEffect(() => {
    if (!map || !userAIsochrone || !userBIsochrone) {
      console.log('IsochroneLayer: Missing requirements', { 
        map: !!map, 
        userAIsochrone: !!userAIsochrone, 
        userBIsochrone: !!userBIsochrone 
      });
      return;
    }

    // Check if map is fully loaded
    if (!map.isStyleLoaded()) {
      console.log('IsochroneLayer: Map style not loaded yet, waiting...');
      const handleStyleLoad = () => {
        console.log('IsochroneLayer: Map style loaded, adding layers now');
        addLayersToMap();
        map.off('style.load', handleStyleLoad);
      };
      map.on('style.load', handleStyleLoad);
      return;
    }

    addLayersToMap();
  }, [map, userAIsochrone, userBIsochrone, userALocation, userBLocation, options]);

  const addLayersToMap = () => {
    if (!map || !userAIsochrone || !userBIsochrone) return;

    console.log('IsochroneLayer: Adding isochrone layers to map', {
      userAIsochrone: userAIsochrone.features.length,
      userBIsochrone: userBIsochrone.features.length
    });

    const addIsochroneLayer = (
      isochroneData: IsochroneData,
      userType: 'A' | 'B',
      color: string
    ) => {
      try {
        const sourceId = `isochrone-${userType}`;
        const layerId = `isochrone-${userType}-fill`;

        console.log(`Adding isochrone layer for user ${userType}:`, {
          sourceId,
          layerId,
          featuresCount: isochroneData.features.length,
          color
        });

        // Add source
        if (map.getSource(sourceId)) {
          console.log(`Updating existing source: ${sourceId}`);
          (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(isochroneData);
        } else {
          console.log(`Adding new source: ${sourceId}`);
          map.addSource(sourceId, {
            type: 'geojson',
            data: isochroneData,
          });
        }

        // Add fill layer
        if (!map.getLayer(layerId)) {
          console.log(`Adding fill layer: ${layerId}`);
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': color,
              'fill-opacity': 0.3,
            },
          });
        } else {
          console.log(`Fill layer already exists: ${layerId}`);
        }

        // Add stroke layer
        const strokeLayerId = `isochrone-${userType}-stroke`;
        if (!map.getLayer(strokeLayerId)) {
          console.log(`Adding stroke layer: ${strokeLayerId}`);
          map.addLayer({
            id: strokeLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': color,
              'line-width': 2,
              'line-opacity': 0.8,
            },
          });
        } else {
          console.log(`Stroke layer already exists: ${strokeLayerId}`);
        }

        layersAddedRef.current.add(layerId);
        layersAddedRef.current.add(strokeLayerId);
      } catch (error) {
        console.error(`Error adding isochrone layer for user ${userType}:`, error);
      }
    };

    // Add user A isochrone (blue)
    addIsochroneLayer(userAIsochrone, 'A', '#3B82F6');

    // Add user B isochrone (red)
    addIsochroneLayer(userBIsochrone, 'B', '#EF4444');

    // Calculate and add overlap area
    if (userALocation && userBLocation) {
      console.log('Calculating overlap area...');
      const overlapArea = calculateOverlapArea(userAIsochrone, userBIsochrone);
      if (overlapArea) {
        console.log('Overlap area calculated:', overlapArea);
        addOverlapLayer(overlapArea);
        onOverlapAreaChange?.(overlapArea);
        
        // Find POIs in overlap area
        findPOIsInOverlapArea(overlapArea);
      } else {
        console.log('No overlap area found');
      }
    }

    // Add click handlers for isochrone layers
    addClickHandlers();
  };

  // Find POIs within the overlap area using the new Mapbox Search API
  const findPOIsInOverlapArea = async (overlapArea: OverlapArea) => {
    try {
      // Calculate the center of the overlap area
      const coordinates = overlapArea.geometry.coordinates[0];
      if (!coordinates || coordinates.length === 0) return;
      
      const center = calculatePolygonCenter(coordinates);
      console.log('Overlap area center:', center);
      
      // Use the Mapbox Search API for reverse geocoding to find POIs
      const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/search/searchbox/v1/reverse?longitude=${center[0]}&latitude=${center[1]}&access_token=${MAPBOX_ACCESS_TOKEN}`;
      
      console.log('Fetching POIs in overlap area using Search API:', url);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch POIs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('POIs found in overlap area:', data);
        
        // Process POI data - can be expanded based on requirements
        if (data && data.features && data.features.length > 0) {
          // Could trigger an event or callback here to send the POIs to a parent component
          console.log(`Found ${data.features.length} POIs in overlap area`);
          
          // You might want to add these POIs as markers on the map or pass them up
          // to the parent component for display in a list
        } else {
          console.log('No POIs found in overlap area');
        }
      } catch (fetchError) {
        console.error('Error fetching POIs:', fetchError);
      }
    } catch (error) {
      console.error('Error finding POIs in overlap area:', error);
    }
  };
  
  // Calculate center of a polygon
  const calculatePolygonCenter = (coordinates: number[][]): [number, number] => {
    if (coordinates.length === 0) return [0, 0];
    
    let totalLng = 0;
    let totalLat = 0;
    
    coordinates.forEach(coord => {
      totalLng += coord[0];
      totalLat += coord[1];
    });
    
    return [totalLng / coordinates.length, totalLat / coordinates.length];
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      removeIsochroneLayers();
    };
  }, []);

  const addOverlapLayer = (overlapArea: any) => {
    const sourceId = 'overlap-area';
    const layerId = 'overlap-area-fill';

    // Add source
    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(overlapArea);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: overlapArea,
      });
    }

    // Add fill layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#10B981',
          'fill-opacity': 0.4,
        },
      });
    }

    // Add stroke layer
    const strokeLayerId = 'overlap-area-stroke';
    if (!map.getLayer(strokeLayerId)) {
      map.addLayer({
        id: strokeLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#10B981',
          'line-width': 3,
          'line-opacity': 1,
        },
      });
    }

    layersAddedRef.current.add(layerId);
    layersAddedRef.current.add(strokeLayerId);
  };

  const addClickHandlers = () => {
    // Add click handler for isochrone layers
    const handleIsochroneClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['isochrone-A-fill', 'isochrone-B-fill', 'overlap-area-fill'],
      });

      if (features.length > 0) {
        const feature = features[0];
        const layerId = feature.layer?.id;
        
        let message = '';
        if (layerId?.includes('A')) {
          message = `User A's ${feature.properties?.contour || 'travel time'} minute area`;
        } else if (layerId?.includes('B')) {
          message = `User B's ${feature.properties?.contour || 'travel time'} minute area`;
        } else if (layerId?.includes('overlap')) {
          message = 'Overlap area - potential meeting spots';
        }
        // Create popup
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${message}</h3>
            </div>
          `)
          .addTo(map);
      }
    };

    map.on('click', handleIsochroneClick);

    // Change cursor on hover
    map.on('mouseenter', 'isochrone-A-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'isochrone-A-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'isochrone-B-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'isochrone-B-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'overlap-area-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'overlap-area-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  const removeIsochroneLayers = () => {
    const layersToRemove = [
      'isochrone-A-fill',
      'isochrone-A-stroke',
      'isochrone-B-fill',
      'isochrone-B-stroke',
      'overlap-area-fill',
      'overlap-area-stroke',
    ];

    const sourcesToRemove = [
      'isochrone-A',
      'isochrone-B',
      'overlap-area',
    ];

    // Remove layers
    layersToRemove.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });

    // Remove sources
    sourcesToRemove.forEach(sourceId => {
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    layersAddedRef.current.clear();
  };

  // Calculate overlap area between two isochrones using martinez-polygon-clipping
  const calculateOverlapArea = (isochroneA: IsochroneData, isochroneB: IsochroneData): OverlapArea | null => {
    console.log('Calculating overlap area between isochrones:', {
      isochroneA: isochroneA.features.length,
      isochroneB: isochroneB.features.length
    });
    
    if (isochroneA.features.length === 0 || isochroneB.features.length === 0) {
      console.log('One or both isochrones have no features');
      return null;
    }

    try {
        // Get the largest polygon from each isochrone
        const polygonA = isochroneA.features[isochroneA.features.length - 1];
        const polygonB = isochroneB.features[isochroneB.features.length - 1];
        
        console.log('Using polygons for intersection:', {
            polygonA: polygonA.properties.contour,
            polygonB: polygonB.properties.contour
        });

        // Format polygons for martinez-polygon-clipping library
        // Martinez expects an array of rings, where each ring is an array of points
        const coordsA = polygonA.geometry.coordinates;
        const coordsB = polygonB.geometry.coordinates;
        
        // Ensure proper formatting for martinez
        // This handles the case where the coordinates might not be in the expected format
        const formattedA = Array.isArray(coordsA[0][0]) ? coordsA : [coordsA];
        const formattedB = Array.isArray(coordsB[0][0]) ? coordsB : [coordsB];
        
        // Calculate intersection
        const intersection = martinez.intersection(formattedA, formattedB);
        
        if (!intersection || intersection.length === 0 || intersection[0].length === 0) {
            console.log('No intersection found between isochrones');
            return null;
        }
        
        // Calculate area (simplified)
        const area = calculatePolygonArea(intersection[0][0]);
        
        // Use Math.min for travel time - consistent with useIsochrone.ts
        const travelTime = Math.min(polygonA.properties.contour, polygonB.properties.contour);
        
        // Create and return overlap area as GeoJSON Feature
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: intersection[0] // Use the first polygon from the intersection
            },
            properties: {
                type: 'overlap',
                area: parseFloat((area / 1000000).toFixed(2)), // Convert to km²
                travelTime,
                userA: 'userA', // Add user IDs if needed
                userB: 'userB',
            },
        };
    } catch (error) {
      console.error('Error calculating isochrone intersection:', error);
      return null;
    }
  };

  // Calculate approximate polygon area
  const calculatePolygonArea = (coordinates: number[][]): number => {
    let area = 0;
    
    if (!coordinates || coordinates.length < 3) return 0;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += x1 * y2 - x2 * y1;
    }
    
    // Close the polygon
    const [x1, y1] = coordinates[coordinates.length - 1];
    const [x2, y2] = coordinates[0];
    area += x1 * y2 - x2 * y1;
    
    // Convert to square meters (approximate for small areas)
    return Math.abs(area) * 0.5 * 111000 * 111000;
  };

  return null; // This component doesn't render anything visible
}
