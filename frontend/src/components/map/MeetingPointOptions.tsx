/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, AlertTriangle, ChevronRight } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { calculateIntersection } from '@/utils/intersectionHelper';
import SearchOptions, { POI } from './SearchOptions';

interface MeetingPointOptionsProps {
    map: mapboxgl.Map | null;
    isochroneData: any; // The raw isochrone data from the API
    onMeetingPointSelected?: (coords: [number, number]) => void;
    onIntersectionCalculated?: (intersectionData: any) => void; // Callback for when intersection is calculated
    onNextStep?: () => void;
}

export default function MeetingPointOptions({
    map,
    isochroneData,
    onMeetingPointSelected = () => {},
    onIntersectionCalculated = () => {},
    onNextStep = () => {}
}: MeetingPointOptionsProps) {
    // State variables
    const [currentView, setCurrentView] = useState<'meeting-point' | 'geocode'>('meeting-point');
    const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
    const [isValidPoint, setIsValidPoint] = useState<boolean>(false);
    const [isPickingPoint, setIsPickingPoint] = useState<boolean>(false);
    const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
    
    // Intersection related states
    const [isIntersectionGenerated, setIsIntersectionGenerated] = useState<boolean>(false);
    const [isIntersectionChecking, setIsIntersectionChecking] = useState<boolean>(false);
    const [noOverlappingAreas, setNoOverlappingAreas] = useState<boolean>(false);
    const [intersectionData, setIntersectionData] = useState<any>(null);
    
    // Marker reference to keep track of the meeting point marker
    const meetingPointMarkerRef = useRef<mapboxgl.Marker | null>(null);
    
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
            if (meetingPointMarkerRef.current) {
                meetingPointMarkerRef.current.remove();
                meetingPointMarkerRef.current = null;
            }
            
            if (isValid) {
                setSelectedPoint(coords);
                setIsValidPoint(true);
                onMeetingPointSelected(coords);
                
                // Add a marker to the map at the clicked location
                const markerElement = document.createElement('div');
                markerElement.className = 'meeting-point-marker';
                
                const marker = new mapboxgl.Marker({
                    color: "#10b981", // Green color
                    element: markerElement
                })
                    .setLngLat(coords)
                    .addTo(map);
                    
                meetingPointMarkerRef.current = marker;
                
                // Fly to the selected point with a nice animation
                map.flyTo({
                    center: coords,
                    zoom: 14,
                    essential: true,
                    duration: 1000
                });
                
                // Move to the geocode options view after a short delay
                setTimeout(() => {
                    setCurrentView('geocode');
                }, 500);
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
    
    // Handle POI selection from the GeocodeOptions component
    const handlePOISelected = (poiId: string) => {
        setSelectedPOI(poiId);
    };
    
    // Return to meeting point selection
    const handleBackToPointSelection = () => {
        setCurrentView('meeting-point');
    };
    
    // Custom CSS for the meeting point marker
    useEffect(() => {
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

    // Clean up marker when component unmounts
    useEffect(() => {
        return () => {
            if (meetingPointMarkerRef.current) {
                meetingPointMarkerRef.current.remove();
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            {currentView === 'meeting-point' ? (
                // Meeting Point Selection View
                <>
                    <div className="mb-6">
                        <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                            <MapPin className="mr-2 text-primary" size={20} />
                            Select Meeting Point
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Pick a meeting point within the overlapping area
                        </p>
                    </div>
                    
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
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // Search Options View
                <SearchOptions
                    map={map}
                    selectedPoint={selectedPoint}
                    onBackToPointSelection={handleBackToPointSelection}
                    onSearchComplete={(pois) => {
                        // Handle search results
                        // This will be updated in a separate PR to handle the LocationChooser component
                        console.log("Search completed with", pois.length, "results");
                        // For now, just proceed to next step
                        onNextStep();
                    }}
                    onNextStep={onNextStep}
                />
            )}
        </div>
    );
}