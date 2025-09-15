/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { MapPin, Search, Compass, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { calculateIntersection } from '@/utils/intersectionHelper';
import { ReverseGeocodingOptions } from '@/utils/geocodingHelper';

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
    const [isSearchingPOIs, setIsSearchingPOIs] = useState<boolean>(false);
    const [pois, setPois] = useState<POI[]>([]);
    const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<any>(null);
    const [isLoadingLocationInfo, setIsLoadingLocationInfo] = useState<boolean>(false);
    const [geocodingRadius, setGeocodingRadius] = useState<number>(10); // Default radius for reverse geocoding
    
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
    
    // Alternative implementation for winding number algorithm
    // This can be used as a fallback if the ray casting algorithm has issues
    const pointInPolygonWinding = (point: [number, number], polygon: [number, number][]): boolean => {
        let wn = 0; // Winding number counter
        
        // Loop through all edges of the polygon
        for (let i = 0; i < polygon.length - 1; i++) {
            if (polygon[i][1] <= point[1]) {
                // Current point y is above or equal to test point
                if (polygon[i+1][1] > point[1]) {
                    // Next point y is strictly above test point
                    if (isLeft(polygon[i], polygon[i+1], point) > 0) {
                        // Test point is to the left of edge
                        wn++;
                    }
                }
            } else {
                // Current point y is below test point
                if (polygon[i+1][1] <= point[1]) {
                    // Next point y is below or equal to test point
                    if (isLeft(polygon[i], polygon[i+1], point) < 0) {
                        // Test point is to the right of edge
                        wn--;
                    }
                }
            }
        }
        
        return wn !== 0;
    };
    
    // Helper function for winding algorithm
    const isLeft = (p0: [number, number], p1: [number, number], point: [number, number]): number => {
        return ((p1[0] - p0[0]) * (point[1] - p0[1]) - (point[0] - p0[0]) * (p1[1] - p0[1]));
    };
    
    // Function to perform reverse geocoding
    const performReverseGeocoding = async (coords: [number, number]) => {
        setIsLoadingLocationInfo(true);
        
        try {
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
                    size: 5,
                    layers: ['venue', 'street', 'locality', 'neighbourhood', 'borough', 'address'],
                    sources: ['openstreetmap', 'openaddresses', 'whosonfirst', 'geonames']
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to perform reverse geocoding');
            }

            const data = await response.json();
            setLocationInfo(data.data);
            console.log('Reverse geocoding results:', data.data);
            
            // You could process the data here to extract the most relevant information
            
        } catch (error: any) {
            console.error('Error during reverse geocoding:', error);
            // Optionally show an error message
        } finally {
            setIsLoadingLocationInfo(false);
        }
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
    
    // Function to handle searching for POIs
    const handleSearchPOIs = () => {
        if (!selectedPoint || !isValidPoint) return;
        
        setIsSearchingPOIs(true);
        
        // Simulate an API call with a timeout
        setTimeout(() => {
            // Dummy POIs data for testing
            const dummyPOIs: POI[] = [
                {
                    id: "poi-1",
                    name: "Central Park Café",
                    category: "Restaurant",
                    distance: 120,
                    address: "123 Park Avenue",
                    coordinates: [106.845, -6.208]
                },
                {
                    id: "poi-2",
                    name: "City Library",
                    category: "Public Service",
                    distance: 230,
                    address: "45 Main Street",
                    coordinates: [106.846, -6.209]
                },
                {
                    id: "poi-3",
                    name: "Tech Hub Coworking",
                    category: "Office",
                    distance: 310,
                    address: "78 Innovation Boulevard",
                    coordinates: [106.844, -6.207]
                },
                {
                    id: "poi-4",
                    name: "Green Space Park",
                    category: "Leisure",
                    distance: 150,
                    address: "90 Nature Way",
                    coordinates: [106.847, -6.206]
                },
                {
                    id: "poi-5",
                    name: "Metro Station",
                    category: "Transportation",
                    distance: 180,
                    address: "Transit Hub",
                    coordinates: [106.843, -6.210]
                }
            ];
            
            // Sort POIs by distance
            const sortedPOIs = [...dummyPOIs].sort((a, b) => a.distance - b.distance);
            setPois(sortedPOIs);
            
            // Move to the POI selection section
            setCurrentSection(2);
            setIsSearchingPOIs(false);
        }, 1500);
    };
    
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
                                        
                                        {/* Geocoding radius slider */}
                                        <div className="mt-3">
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
                                                max="50"
                                                step="5"
                                                value={geocodingRadius}
                                                onChange={(e) => {
                                                    const newRadius = parseInt(e.target.value);
                                                    setGeocodingRadius(newRadius);
                                                    if (selectedPoint) {
                                                        performReverseGeocoding(selectedPoint);
                                                    }
                                                }}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-2">
                                            {/* Test button for geocoding */}
                                            {!locationInfo && !isLoadingLocationInfo && (
                                                <button
                                                    onClick={() => selectedPoint && performReverseGeocoding(selectedPoint)}
                                                    className="text-xs px-2 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white"
                                                >
                                                    Test Geocoding
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={handlePickMeetingPoint} 
                                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                            >
                                                Pick a different point
                                            </button>
                                        </div>
                                        
                                        {/* Next button to find nearby POIs */}
                                        {selectedPoint && isValidPoint && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={handleSearchPOIs}
                                                    className="w-full flex items-center justify-center py-2 rounded-lg transition-colors font-medium
                                                        bg-blue-500 hover:bg-blue-600 text-white"
                                                >
                                                    <Search size={18} className="mr-2" />
                                                    Find Nearby Points of Interest
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Find nearby POIs button - only enabled if a valid point is selected */}
                    <button
                        onClick={handleSearchPOIs}
                        disabled={!selectedPoint || !isValidPoint || isSearchingPOIs}
                        className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors mt-4 font-medium
                            ${selectedPoint && isValidPoint && !isSearchingPOIs
                                ? 'bg-primary hover:bg-primary/90 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
                    >
                        {isSearchingPOIs ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching Nearby Locations...
                            </>
                        ) : (
                            <>
                                <Search size={18} className="mr-2" />
                                Find Nearby Places
                            </>
                        )}
                    </button>
                </>
            ) : (
                <>
                    {/* POI Selection Section */}
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Nearby Points of Interest</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Select a location from the list below or choose your own meeting point
                        </p>
                        
                        {/* POI List */}
                        <div className="space-y-2 mt-4">
                            {pois.map((poi) => (
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {poi.category} · {poi.address}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm ${selectedPOI === poi.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {poi.distance}m
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {/* Back button to return to meeting point selection */}
                        <button
                            onClick={() => setCurrentSection(1)}
                            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary mt-4"
                        >
                            Choose a different meeting point
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
