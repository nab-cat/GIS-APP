/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { MapPin, Search, Compass, AlertTriangle, ChevronRight } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { calculateIntersection } from '@/utils/intersectionHelper';

interface MeetingPointOptionsProps {
    map: mapboxgl.Map | null;
    isochroneData: any; // The raw isochrone data from the API
    onMeetingPointSelected?: (coords: [number, number]) => void;
    onIntersectionCalculated?: (intersectionData: any) => void; // Callback for when intersection is calculated
    onNextStep?: () => void;
}

interface POI {
    id: string;
    name: string;
    category: string;
    distance: number;
    address: string;
    coordinates: [number, number];
}

export default function MeetingPointOptions({
    map,
    isochroneData,
    onMeetingPointSelected = () => {},
    onIntersectionCalculated = () => {},
    onNextStep = () => {}
}: MeetingPointOptionsProps) {
    // State variables
    const [currentSection, setCurrentSection] = useState<1 | 2>(1); // 1: Meeting point selection, 2: POI selection
    const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
    const [isValidPoint, setIsValidPoint] = useState<boolean>(false);
    const [isPickingPoint, setIsPickingPoint] = useState<boolean>(false);
    const [pois, setPois] = useState<POI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<any>(null);
    const [isLoadingLocationInfo, setIsLoadingLocationInfo] = useState<boolean>(false);
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
    
    // Intersection related states
    const [isIntersectionGenerated, setIsIntersectionGenerated] = useState<boolean>(false);
    const [isIntersectionChecking, setIsIntersectionChecking] = useState<boolean>(false);
    const [noOverlappingAreas, setNoOverlappingAreas] = useState<boolean>(false);
    const [intersectionData, setIntersectionData] = useState<any>(null);
    
    // Function to handle intersection calculation
    const handleCheckIntersection = () => {
        if (!isochroneData) {
            console.error("No isochrone data available for intersection calculation");
            return;
        }
        
        setIsIntersectionChecking(true);
        setNoOverlappingAreas(false); // Reset the warning state
        
        try {
            // Call the intersection helper with the isochrone data
            const result = calculateIntersection(isochroneData);
            
            // Pass the result to the parent component via callback
            if (result.success) {
                // Check if there are any features in the intersection
                if (result.features && result.features.length > 0) {
                    setIntersectionData(result);
                    onIntersectionCalculated(result);
                    setIsIntersectionGenerated(true);
                    setNoOverlappingAreas(false);
                    console.log("Intersection calculated successfully:", result);
                } else {
                    // No overlapping areas found
                    setNoOverlappingAreas(true);
                    setIsIntersectionGenerated(false);
                    console.log("No overlapping areas found between the isochrones");
                }
            } else {
                console.error("Intersection calculation failed:", result.error);
                alert(`Could not calculate intersection: ${result.error}`);
            }
        } catch (error: any) {
            console.error("Error during intersection calculation:", error);
            alert(`Error calculating intersection: ${error.message}`);
        } finally {
            setIsIntersectionChecking(false);
        }
    };
    
    // Function to check if a point is within the intersection polygon
    const checkPointInIntersection = (coords: [number, number]): boolean => {
        if (!intersectionData || !intersectionData.features || intersectionData.features.length === 0) {
            return false;
        }
        
        // Check if the point is within any polygon of the intersection
        for (const feature of intersectionData.features) {
            if (feature.geometry.type === 'Polygon') {
                if (isPointInPolygon(coords, feature.geometry.coordinates[0])) {
                    return true;
                }
            } else if (feature.geometry.type === 'MultiPolygon') {
                for (const polygon of feature.geometry.coordinates) {
                    if (isPointInPolygon(coords, polygon[0])) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    };
    
    // Simple point-in-polygon algorithm (ray casting)
    const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
        // Implementation of ray casting algorithm
        // Reference: https://en.wikipedia.org/wiki/Point_in_polygon
        
        const x = point[0];
        const y = point[1];
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0];
            const yi = polygon[i][1];
            const xj = polygon[j][0];
            const yj = polygon[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                
            if (intersect) {
                inside = !inside;
            }
        }
        
        return inside;
    };
    
    // Removed unused point-in-polygon functions
    
    // Function to perform reverse geocoding
    const performReverseGeocoding = async (coords: [number, number]) => {
        setIsLoadingLocationInfo(true);
        setPois([]); // Clear any previous POIs
        
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
                        lon: coords[0],
                        lat: coords[1]
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
            setLocationInfo(data.data);
            console.log('Reverse geocoding results:', data.data);
            
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
                            coords // Default to meeting point if no coordinates
                    };
                });
                
                setPois(poiResults);
                
                // Add POI markers to the map
                addPOIMarkersToMap(poiResults);
            }
        } catch (error: any) {
            console.error('Error during reverse geocoding:', error);
            // Optionally show an error message
        } finally {
            setIsLoadingLocationInfo(false);
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
                setSelectedPOI(poi.id);
            });
        });
    };
    
    // Function to handle meeting point selection
    const handlePickMeetingPoint = () => {
        if (!map) return;
        
        setIsPickingPoint(true);
        
        // Change cursor to crosshair
        map.getCanvas().style.cursor = 'crosshair';
        
        // Show a message that we're in pick mode
        const pickModeInfo = document.createElement('div');
        pickModeInfo.id = 'pick-mode-info';
        pickModeInfo.className = 'bg-green-100 text-green-700 p-2 rounded-md fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center shadow-md';
        pickModeInfo.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            Click on the intersection area to place a meeting point
        `;
        document.body.appendChild(pickModeInfo);
        
        // Set up a one-time click handler
        const clickHandler = (e: mapboxgl.MapMouseEvent) => {
            const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            
            // Check if the clicked point is within the intersection
            const isValid = checkPointInIntersection(coords);
            
            // Remove any existing meeting point markers
            const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
            existingMarkers.forEach(marker => {
                if (marker.classList.contains('meeting-point-marker')) {
                    marker.remove();
                }
            });
            
            if (isValid) {
                setSelectedPoint(coords);
                setIsValidPoint(true);
                onMeetingPointSelected(coords);
                
                // Add a marker to the map at the clicked location
                const markerElement = document.createElement('div');
                markerElement.className = 'meeting-point-marker';
                
                new mapboxgl.Marker({
                    color: "#10b981", // Green color
                    element: markerElement
                })
                    .setLngLat(coords)
                    .addTo(map);
                
                // Fly to the selected point with a nice animation
                map.flyTo({
                    center: coords,
                    zoom: 14,
                    essential: true,
                    duration: 1000
                });
                
                // Perform reverse geocoding
                performReverseGeocoding(coords);
            } else {
                setSelectedPoint(coords);
                setIsValidPoint(false);
                
                // Show an alert for invalid location
                alert("The selected point must be within the overlapping area. Please try again.");
            }
            
            // Clean up
            map.getCanvas().style.cursor = '';
            map.off('click', clickHandler);
            document.getElementById('pick-mode-info')?.remove();
            setIsPickingPoint(false);
        };
        
        // Add the click handler to the map
        map.once('click', clickHandler);
        
        // Allow cancelling with Escape key
        const escapeHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                map.getCanvas().style.cursor = '';
                map.off('click', clickHandler);
                document.getElementById('pick-mode-info')?.remove();
                setIsPickingPoint(false);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
    };
    
    // Removed unused handleViewPOIs function
    
    // Function to handle POI selection
    const handleSelectPOI = (poiId: string) => {
        setSelectedPOI(poiId);
    };
    
    // Custom CSS for the marker and cursor
    React.useEffect(() => {
        // Add custom CSS for the marker
        const style = document.createElement('style');
        style.innerHTML = `
            .meeting-point-marker {
                background-color: #10b981;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                border: 2px solid white;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
                cursor: pointer;
                animation: marker-pulse 1.5s infinite;
            }
            
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
            
            @keyframes marker-pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                }
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
            <div className="mb-6">
                <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                    <MapPin className="mr-2 text-primary" size={20} />
                    {currentSection === 1 ? "Select Meeting Point" : "Choose Nearby Location"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {currentSection === 1 
                        ? "Pick a meeting point within the overlapping area" 
                        : "Select a nearby point of interest for your meeting"}
                </p>
            </div>
            
            {/* Step indicators */}
            <div className="flex mb-6">
                <div 
                    className={`flex-1 text-center border-b-2 pb-2 ${
                        currentSection === 1 ? 'border-primary text-primary font-medium' : 'border-gray-200 text-gray-500'
                    }`}
                >
                    1. Find Meeting Point
                </div>
                <div 
                    className={`flex-1 text-center border-b-2 pb-2 ${
                        currentSection === 2 ? 'border-primary text-primary font-medium' : 'border-gray-200 text-gray-500'
                    }`}
                >
                    2. Choose Location
                </div>
            </div>
            
            {currentSection === 1 ? (
                <>
                    {/* Meeting Point Selection Section */}
                    <div className="mb-6">
                        {/* Check Intersection Button */}
                        <button
                            onClick={handleCheckIntersection}
                            disabled={isIntersectionChecking || !isochroneData}
                            className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors font-medium mb-4
                                ${!isIntersectionChecking && isochroneData
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
                        >
                            {isIntersectionChecking ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Calculating Intersection...
                                </>
                            ) : (
                                <>
                                    <ChevronRight size={18} className="mr-2" />
                                    Check Intersection
                                </>
                            )}
                        </button>

                        {/* Warning message for no overlapping areas */}
                        {noOverlappingAreas && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        No overlapping areas found between the isochrones. Please adjust your settings and try again.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pick Meeting Point Button - Disabled until intersection is generated */}
                        <button
                            onClick={handlePickMeetingPoint}
                            disabled={isPickingPoint || !isIntersectionGenerated}
                            className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors font-medium
                                ${(!isPickingPoint && isIntersectionGenerated)
                                    ? 'bg-primary hover:bg-primary/90 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
                        >
                            {isPickingPoint ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Selecting Point...
                                </>
                            ) : (
                                <>
                                    <Compass size={18} className="mr-2" />
                                    Pick Meeting Point
                                </>
                            )}
                        </button>
                        
                        {/* Meeting point instructions */}
                        {isIntersectionGenerated && !isPickingPoint && !selectedPoint && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                Click the button above, then click on the green overlapping area to place your meeting point
                            </div>
                        )}
                        
                        {isPickingPoint && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                                Click on the highlighted intersection area on the map or press Escape to cancel
                            </div>
                        )}
                        
                        {/* Warning if selected point is not within intersection */}
                        {selectedPoint && !isValidPoint && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mt-4">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        The selected point must be within the overlapping area. Please try again.
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Point details if selected and valid */}
                        {selectedPoint && isValidPoint && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mt-4">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-green-500 mr-2" />
                                    <div className="w-full">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                            Meeting point selected
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            Coordinates: {selectedPoint[0].toFixed(6)}, {selectedPoint[1].toFixed(6)}
                                        </p>
                                        
                                        {/* Location info from reverse geocoding */}
                                        {isLoadingLocationInfo && (
                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Looking up location...
                                            </div>
                                        )}
                                        
                                        {locationInfo && locationInfo.features && locationInfo.features.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Location Details
                                                </p>
                                                <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                                    {locationInfo.features.slice(0, 2).map((feature: any, index: number) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="mr-1">•</span>
                                                            <span>
                                                                {feature.properties.label || 
                                                                 feature.properties.name || 
                                                                 (feature.properties.street ? 
                                                                    `${feature.properties.housenumber || ''} ${feature.properties.street}` : 
                                                                    'Unknown location')}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Geocoding options section */}
                                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nearby Search Options
                                            </h4>
                                            
                                            {/* Radius slider */}
                                            <div className="mb-3">
                                                <label 
                                                    htmlFor="geocoding-radius" 
                                                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    Search radius: {geocodingRadius} m
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
                                            </div>
                                            
                                            {/* Results count */}
                                            <div className="mb-3">
                                                <label 
                                                    htmlFor="results-count" 
                                                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                >
                                                    Number of results: {geocodingResultsCount}
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
                                            </div>
                                            
                                            {/* Sources checkboxes */}
                                            <div className="mb-3">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Data sources:
                                                </p>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {Object.keys(selectedSources).map(source => (
                                                        <label key={source} className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSources[source as keyof typeof selectedSources]}
                                                                onChange={() => {
                                                                    setSelectedSources({
                                                                        ...selectedSources,
                                                                        [source]: !selectedSources[source as keyof typeof selectedSources]
                                                                    });
                                                                }}
                                                                className="form-checkbox h-3 w-3 text-blue-600 rounded mr-1"
                                                            />
                                                            {source}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Layers checkboxes */}
                                            <div className="mb-3">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Place types:
                                                </p>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {Object.keys(selectedLayers).map(layer => (
                                                        <label key={layer} className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedLayers[layer as keyof typeof selectedLayers]}
                                                                onChange={() => {
                                                                    setSelectedLayers({
                                                                        ...selectedLayers,
                                                                        [layer]: !selectedLayers[layer as keyof typeof selectedLayers]
                                                                    });
                                                                }}
                                                                className="form-checkbox h-3 w-3 text-blue-600 rounded mr-1"
                                                            />
                                                            {layer}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Search button */}
                                            <button
                                                onClick={() => selectedPoint && performReverseGeocoding(selectedPoint)}
                                                className="w-full text-center py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded mt-2"
                                            >
                                                Search Nearby Locations
                                            </button>
                                            
                                            {/* View Results button - only shown when POIs are available */}
                                            {pois.length > 0 && (
                                                <button
                                                    onClick={() => setCurrentSection(2)}
                                                    className="w-full text-center py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded mt-2"
                                                >
                                                    View {pois.length} Results
                                                </button>
                                            )}
                                        </div>
                                        
                                                        <div className="flex justify-end mt-2">
                                            <button 
                                                onClick={handlePickMeetingPoint} 
                                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                            >
                                                Pick a different point
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* POI Results Section */}
                    {pois && pois.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                    Found {pois.length} Nearby Locations
                                </h4>
                                <button
                                    onClick={() => setCurrentSection(1)}
                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Search
                                </button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {pois.map((poi) => (
                                    <div
                                        key={poi.id}
                                        onClick={() => handleSelectPOI(poi.id)}
                                        className={`w-full flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                                            ${selectedPOI === poi.id
                                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <MapPin 
                                            size={18} 
                                            className={`mt-0.5 mr-2 flex-shrink-0 ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-500'}`}
                                        />
                                        <div className="flex-grow">
                                            <p className={`text-sm font-medium ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {poi.name || 'Unnamed Location'}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                                    {poi.category || 'Place'}
                                                </span>
                                                {poi.distance !== null && (
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        {poi.distance}m
                                                    </span>
                                                )}
                                            </div>
                                            {poi.address && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {poi.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* POI Selection Section */}
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Location Details</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Select a location from the list or return to adjust your meeting point
                        </p>
                        
                        {/* POI List */}
                        <div className="space-y-2 mt-4 max-h-80 overflow-y-auto pr-1">
                            {pois.length > 0 ? pois.map((poi) => (
                                <button
                                    key={poi.id}
                                    onClick={() => handleSelectPOI(poi.id)}
                                    className={`w-full flex items-start justify-between p-3 rounded-lg border transition-colors
                                        ${selectedPOI === poi.id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className="flex items-start">
                                        <MapPin size={16} className="mt-0.5 mr-3" />
                                        <div className="text-left">
                                            <p className={`font-medium ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {poi.name}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {poi.category}
                                                </span>
                                                {poi.distance !== null && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {poi.distance}m
                                                    </span>
                                                )}
                                            </div>
                                            {poi.address && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {poi.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                                        <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No locations found</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Try adjusting your search radius or filters
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Search options section */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Search Options</h4>
                            
                            {/* Radius slider */}
                            <div className="mb-3">
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Radius: {geocodingRadius}m
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="100"
                                    step="5"
                                    value={geocodingRadius}
                                    onChange={(e) => setGeocodingRadius(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>
                            
                            {/* Search button */}
                            <button
                                onClick={() => selectedPoint && performReverseGeocoding(selectedPoint)}
                                disabled={isLoadingLocationInfo || !selectedPoint}
                                className={`w-full py-2 rounded-md mt-2 text-sm font-medium
                                    ${!isLoadingLocationInfo 
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isLoadingLocationInfo ? 'Searching...' : 'Search Again'}
                            </button>
                        </div>
                        
                        {/* Back button to return to meeting point selection */}
                        <button
                            onClick={() => setCurrentSection(1)}
                            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary mt-4"
                        >
                            ← Return to meeting point selection
                        </button>
                    </div>
                    
                    {/* Next Step Button */}
                    <button
                        onClick={onNextStep}
                        disabled={!selectedPOI}
                        className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors mt-4 font-medium
                            ${selectedPOI
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
                    >
                        <ChevronRight size={18} className="mr-2" />
                        Confirm Meeting Location
                    </button>
                </>
            )}
        </div>
    );
}
