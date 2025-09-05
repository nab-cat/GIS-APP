import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { IsochroneData, IsochroneOptions } from '@/types/isochrone';
import { Location } from '@/types/location';

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
      } else {
        console.log('No overlap area found');
      }
    }

    // Add click handlers for isochrone layers
    addClickHandlers();
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

  // Calculate overlap area between two isochrones
  const calculateOverlapArea = (isochroneA: IsochroneData, isochroneB: IsochroneData) => {
    console.log('Calculating overlap area between isochrones:', {
      isochroneA: isochroneA.features.length,
      isochroneB: isochroneB.features.length
    });

    // This is a simplified implementation
    // In a real application, you'd use a proper geometric library like Turf.js
    
    if (isochroneA.features.length === 0 || isochroneB.features.length === 0) {
      console.log('One or both isochrones have no features');
      return null;
    }

    // For now, we'll create a simple overlap area
    // You would implement proper polygon intersection here
    const polygonA = isochroneA.features[isochroneA.features.length - 1];
    const polygonB = isochroneB.features[isochroneB.features.length - 1];
    
    console.log('Using polygons:', {
      polygonA: polygonA.properties.contour,
      polygonB: polygonB.properties.contour
    });

    // Use the smaller polygon as a simple overlap approximation
    const smallerPolygon = polygonA.properties.contour <= polygonB.properties.contour ? polygonA : polygonB;
    
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: smallerPolygon.geometry.coordinates,
      },
      properties: {
        type: 'overlap',
        area: 0,
        travelTime: smallerPolygon.properties.contour,
      },
    };
  };

  return null; // This component doesn't render anything visible
}
