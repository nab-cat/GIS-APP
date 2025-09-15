/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { MapPin, Search, ArrowLeft } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

// Import new components
import GeocodeSearchOptions, { SearchOptions } from './GeocodeSearchOptions';
import GeocodeLocationChooser, { POI } from './GeocodeLocationChooser';

interface GeocodeOptionsProps {
    map: mapboxgl.Map | null;
    selectedPoint: [number, number] | null;
    onBackToPointSelection: () => void;
    onPOISelected: (poiId: string) => void;
    onNextStep?: () => void;
}

export default function GeocodeOptions({ 
    map, 
    selectedPoint, 
    onBackToPointSelection, 
    onPOISelected, 
    onNextStep 
}: GeocodeOptionsProps) {
    // State variables for geocoding options
    const [currentStep, setCurrentStep] = useState<number>(1); // 1: Search Options, 2: Choose Location
    const [pois, setPois] = useState<POI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
    const [isLoadingPOIs, setIsLoadingPOIs] = useState<boolean>(false);
    
    // Function to perform reverse geocoding with search options
    const handleSearch = async (searchOptions: SearchOptions) => {
        if (!selectedPoint) return;
        
        setIsLoadingPOIs(true);
        setPois([]); // Clear any previous POIs
        
        try {
            // Get selected sources and layers from search options
            const sources = Object.keys(searchOptions.sources).filter(
                key => searchOptions.sources[key as keyof typeof searchOptions.sources]
            );
            
            const layers = Object.keys(searchOptions.layers).filter(
                key => searchOptions.layers[key as keyof typeof searchOptions.layers]
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
                    boundaryCircleRadius: searchOptions.radius,
                    size: searchOptions.resultsCount,
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
                
                setPois(poiResults);
                
                // Add POI markers to the map
                addPOIMarkersToMap(poiResults);
                
                // Move to next step
                setCurrentStep(2);
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
            
            // Select POI on click
            markerElement.addEventListener('click', () => {
                handlePOISelection(poi.id);
            });
        });
    };
    
    // Function to handle POI selection
    const handlePOISelection = (poiId: string) => {
        setSelectedPOI(poiId);
        onPOISelected(poiId);
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
            
            .poi-marker.selected {
                background-color: #f59e0b;
                box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.6);
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

    // Check if a step is enabled
    const isStepEnabled = (step: number): boolean => {
        if (step === 1) return true; // First step is always enabled
        if (step === 2) return pois.length > 0; // Second step only if we have results
        return false;
    };

    // Handle step click
    const handleStepClick = (step: number) => {
        if (isStepEnabled(step)) {
            setCurrentStep(step);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        {currentStep === 1 ? (
                            <>
                                <Search className="mr-2 text-primary" size={20} />
                                Nearby Places
                            </>
                        ) : (
                            <>
                                <MapPin className="mr-2 text-primary" size={20} />
                                Nearby Places
                            </>
                        )}
                    </h3>
                    <button 
                        onClick={onBackToPointSelection}
                        className="text-sm text-primary hover:text-primary/80 flex items-center font-medium"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Meeting Point
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {currentStep === 1 
                        ? "Configure search options for nearby places" 
                        : "Select a nearby place for your meeting"}
                </p>
            </div>
            
            {/* Render the appropriate component based on the current step */}
            {currentStep === 1 ? (
                <GeocodeSearchOptions 
                    onSearch={handleSearch}
                    selectedPoint={selectedPoint}
                    isLoading={isLoadingPOIs}
                />
            ) : (
                <GeocodeLocationChooser
                    pois={pois}
                    onBackToSearchOptions={() => setCurrentStep(1)}
                    onSelectPOI={handlePOISelection}
                    selectedPOI={selectedPOI}
                    onNextStep={onNextStep}
                />
            )}
        </div>
    );
}