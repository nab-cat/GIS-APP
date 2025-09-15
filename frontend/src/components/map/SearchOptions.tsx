/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

export interface SearchOptions {
    radius: number;
    resultsCount: number;
    sources: {
        openstreetmap: boolean;
        openaddresses: boolean;
        whosonfirst: boolean;
        geonames: boolean;
    };
    layers: {
        venue: boolean;
        street: boolean;
        locality: boolean;
        neighbourhood: boolean;
        borough: boolean;
        address: boolean;
    };
}

// Define interface for POI that will be used in the next step
export interface POI {
    id: string;
    name: string;
    category: string;
    distance: number;
    address: string;
    coordinates: [number, number];
}

interface SearchOptionsProps {
    map: mapboxgl.Map | null;
    selectedPoint: [number, number] | null;
    onBackToPointSelection: () => void;
    onSearchComplete: (pois: POI[]) => void;
    onNextStep?: () => void;
}

export default function SearchOptions({ 
    map, 
    selectedPoint, 
    onBackToPointSelection,
    onSearchComplete,
    onNextStep 
}: SearchOptionsProps) {
    // State variables for geocoding options
    const [isLoadingPOIs, setIsLoadingPOIs] = useState<boolean>(false);
    const [geocodingRadius, setGeocodingRadius] = useState<number>(10); // Default radius for reverse geocoding
    const [geocodingResultsCount, setGeocodingResultsCount] = useState<number>(10); // Default number of results
    
    // Sources for geocoding
    const [selectedSources, setSelectedSources] = useState<{
        openstreetmap: boolean;
        openaddresses: boolean;
        whosonfirst: boolean;
        geonames: boolean;
    }>({
        openstreetmap: true,
        openaddresses: true,
        whosonfirst: true,
        geonames: true
    });
    
    // Layers for geocoding
    const [selectedLayers, setSelectedLayers] = useState<{
        venue: boolean;
        street: boolean;
        locality: boolean;
        neighbourhood: boolean;
        borough: boolean;
        address: boolean;
    }>({
        venue: true,
        street: true,
        locality: true,
        neighbourhood: true,
        borough: true,
        address: true
    });
    
    // Function to perform reverse geocoding
    const handleSearch = async () => {
        if (!selectedPoint) return;
        
        setIsLoadingPOIs(true);
        
        try {
            // Get selected sources and layers
            const sources = Object.keys(selectedSources).filter(
                key => selectedSources[key as keyof typeof selectedSources]
            );
            
            const layers = Object.keys(selectedLayers).filter(
                key => selectedLayers[key as keyof typeof selectedLayers]
            );
            
            // Call the API to get location info
            const response = await fetch('/api/reverse-geocode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    point: {
                        lon: selectedPoint[0],
                        lat: selectedPoint[1]
                    },
                    boundaryCircleRadius: geocodingRadius,
                    size: geocodingResultsCount,
                    layers: layers.length > 0 ? layers : undefined,
                    sources: sources.length > 0 ? sources : undefined
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to perform reverse geocoding');
            }

            const data = await response.json();
            
            // Convert results to POIs for display
            if (data.data && data.data.features && data.data.features.length > 0) {
                const poiResults: POI[] = data.data.features.map((feature: any, index: number) => {
                    const props = feature.properties;
                    return {
                        id: props.id || `poi-${index}`,
                        name: props.name || props.label || 'Unnamed location',
                        category: props.layer || 'Unknown',
                        distance: props.distance ? Math.round(props.distance * 1000) : null, // Convert to meters
                        address: props.label || '',
                        coordinates: feature.geometry ? 
                            [feature.geometry.coordinates[0], feature.geometry.coordinates[1]] :
                            selectedPoint // Default to meeting point if no coordinates
                    };
                });
                
                // Add POI markers to the map
                addPOIMarkersToMap(poiResults);
                
                // Pass POIs to parent
                onSearchComplete(poiResults);
                
                // Move to next step if provided
                if (onNextStep) {
                    onNextStep();
                }
            } else {
                // No results found
                alert("No locations found. Try increasing the search radius or changing the search options.");
            }
        } catch (error: any) {
            console.error('Error during reverse geocoding:', error);
            alert(`Error finding nearby locations: ${error.message}`);
        } finally {
            setIsLoadingPOIs(false);
        }
    };

    // Function to add POI markers to the map
    const addPOIMarkersToMap = (poiList: POI[]) => {
        if (!map) return;
        
        // Remove any existing POI markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(marker => {
            if (marker.classList.contains('poi-marker')) {
                marker.remove();
            }
        });
        
        // Add new markers for each POI
        poiList.forEach((poi) => {
            // Create a custom marker element
            const markerElement = document.createElement('div');
            markerElement.className = 'poi-marker';
            
            // Create a marker
            const marker = new mapboxgl.Marker({
                element: markerElement,
                color: "#3b82f6", // Blue color for POIs
                scale: 0.8
            })
                .setLngLat(poi.coordinates)
                .addTo(map);
                
            // Add a popup with POI info
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
                offset: 25
            })
                .setHTML(`
                    <div class="p-2">
                        <h3 class="font-bold text-sm">${poi.name}</h3>
                        <p class="text-xs text-gray-600">${poi.category}</p>
                        ${poi.distance ? `<p class="text-xs">${poi.distance}m away</p>` : ''}
                    </div>
                `);
                
            // Show popup on hover
            markerElement.addEventListener('mouseenter', () => {
                marker.setPopup(popup);
                popup.addTo(map);
            });
            
            // Hide popup when mouse leaves
            markerElement.addEventListener('mouseleave', () => {
                popup.remove();
            });
        });
    };
    
    // Custom CSS for the markers
    React.useEffect(() => {
        // Add custom CSS for the marker
        const style = document.createElement('style');
        style.innerHTML = `
            .poi-marker {
                background-color: #3b82f6;
                border-radius: 50%;
                width: 14px;
                height: 14px;
                border: 2px solid white;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .poi-marker:hover {
                transform: scale(1.2);
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6);
            }
            
            .mapboxgl-popup-content {
                padding: 10px;
                border-radius: 6px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);
        
        // Clean up
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Search className="mr-2 text-primary" size={20} />
                        Search Nearby Places
                    </h3>
                    <button 
                        onClick={onBackToPointSelection}
                        className="text-sm text-primary hover:text-primary/80 flex items-center font-medium"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure search options for nearby places
                </p>
            </div>
            
            {/* Radius slider */}
            <div className="mb-5">
                <label 
                    htmlFor="geocoding-radius" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Search radius: <span className="text-primary font-semibold">{geocodingRadius} meters</span>
                </label>
                <input
                    type="range"
                    id="geocoding-radius"
                    min="5"
                    max="100"
                    step="5"
                    value={geocodingRadius}
                    onChange={(e) => {
                        const newRadius = parseInt(e.target.value);
                        setGeocodingRadius(newRadius);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5m</span>
                    <span>50m</span>
                    <span>100m</span>
                </div>
            </div>
            
            {/* Results count */}
            <div className="mb-5">
                <label 
                    htmlFor="results-count" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Number of results: <span className="text-primary font-semibold">{geocodingResultsCount}</span>
                </label>
                <input
                    type="range"
                    id="results-count"
                    min="1"
                    max="20"
                    step="1"
                    value={geocodingResultsCount}
                    onChange={(e) => {
                        setGeocodingResultsCount(parseInt(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                </div>
            </div>
            
            {/* Sources checkboxes */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Data sources:
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {Object.keys(selectedSources).map(source => (
                        <label key={source} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={selectedSources[source as keyof typeof selectedSources]}
                                onChange={() => {
                                    setSelectedSources({
                                        ...selectedSources,
                                        [source]: !selectedSources[source as keyof typeof selectedSources]
                                    });
                                }}
                                className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                            />
                            {source}
                        </label>
                    ))}
                </div>
            </div>
            
            {/* Layers checkboxes */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Place types:
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {Object.keys(selectedLayers).map(layer => (
                        <label key={layer} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={selectedLayers[layer as keyof typeof selectedLayers]}
                                onChange={() => {
                                    setSelectedLayers({
                                        ...selectedLayers,
                                        [layer]: !selectedLayers[layer as keyof typeof selectedLayers]
                                    });
                                }}
                                className="form-checkbox h-4 w-4 text-primary rounded mr-2"
                            />
                            {layer}
                        </label>
                    ))}
                </div>
            </div>
            
            {/* Search button */}
            <button
                onClick={handleSearch}
                disabled={!selectedPoint || isLoadingPOIs}
                className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors font-medium
                    ${(!isLoadingPOIs && selectedPoint)
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
            >
                {isLoadingPOIs ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching Nearby Places...
                    </>
                ) : (
                    <>
                        <Search size={18} className="mr-2" />
                        Search & Continue to Next Step
                    </>
                )}
            </button>
        </div>
    );
}