/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import TwoPointSelector from "@/components/map/TwoPointSelector";
import StepsIndicator from "@/components/map/StepsIndicator";
import IsochroneOptions, { IsochroneRequestOptions } from "@/components/map/IsochroneOptions";
import MeetingPointOptions from "@/components/map/MeetingPointOptions";
import Navbar from "@/components/Navbar";
import { MapIcon, ChevronLeft } from "lucide-react";
import { generateIsochrones } from "@/utils/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [showPickerHint, setShowPickerHint] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start with sidebar open
    const [selectedLocations, setSelectedLocations] = useState<[number, number][]>([]);
    const [isProcessingIsochrones, setIsProcessingIsochrones] = useState(false);
    const [isochroneData, setIsochroneData] = useState<any>(null);
    const [intersectionData, setIntersectionData] = useState<any>(null);
    const [meetingPoint, setMeetingPoint] = useState<[number, number] | null>(null);
    
    // Handle step navigation
    const goToNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };
    
    const goToPreviousStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };
    
    // Handle meeting point selection
    const handleMeetingPointSelected = (coords: [number, number]) => {
        setMeetingPoint(coords);
        console.log("Selected meeting point:", coords);
    };

    useEffect(() => {
        // Initialize map only once
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/nabcat/cmeogbsmg000j01sf76ji60t8",
            center: [106.8456, -6.2088], // Jakarta
            zoom: 12,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        
        // Add global geolocate control for the map
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            }),
            "top-right"
        );

        // Clean up function
        return () => {
            map.remove();
        };
    }, []);

    // Handle marker placement
    const handleLocationSelected = (index: number, lng: number, lat: number, label: string) => {
        if (!mapRef.current) return;
        
        // Remove existing marker at this index if it exists
        if (markersRef.current[index]) {
            markersRef.current[index].remove();
            markersRef.current[index] = null!;
        }
        
        // If this is a clear operation (empty label), return after removing marker
        if (!label) {
            // Update our selected locations array
            const newLocations = [...selectedLocations];
            if (newLocations[index]) {
                newLocations[index] = null!;
                setSelectedLocations(newLocations.filter(Boolean) as [number, number][]);
            }
            return;
        }
        
        // Create marker with color based on index (blue for first, red for second)
        const markerColor = index === 0 ? "#3b82f6" : "#ef4444";
        
        // Create popup
        const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false 
        }).setHTML(
            `<div class="p-3">
                <h3 class="font-bold mb-1">${label}</h3>
                <p class="text-sm text-gray-600">Long: ${lng.toFixed(4)} | Lat: ${lat.toFixed(4)}</p>
            </div>`
        );
        
        // Add new marker
        const marker = new mapboxgl.Marker({
            color: markerColor,
            draggable: false,
        })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapRef.current);
        
        // Save reference to marker
        markersRef.current[index] = marker;
        
        // Show popup
        marker.togglePopup();
        
        // Update our selected locations array
        const newLocations = [...selectedLocations];
        newLocations[index] = [lng, lat];
        setSelectedLocations(newLocations.filter(Boolean) as [number, number][]);
        
        // If both markers exist, update the map view to include both
        setTimeout(() => {
            if (markersRef.current[0] && markersRef.current[1]) {
                fitMapToMarkers();
            }
        }, 100); // Small delay to ensure map and markers are ready
    };
    
    // Toggle sidebar function
    const toggleSidebar = (isOpen: boolean) => {
        setIsSidebarOpen(isOpen);
    };
    
    // Fit map to show both markers
    const fitMapToMarkers = () => {
        if (!mapRef.current) return;
        
        // Check if we have both markers
        const validMarkers = markersRef.current.filter(marker => marker);
        if (validMarkers.length < 2) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        validMarkers.forEach(marker => {
            bounds.extend(marker.getLngLat());
        });
        
        mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 15,
            duration: 800  // Add smooth animation
        });
    };
    
    // Handle isochrone generation
    // Handle displaying intersection data on the map
    const handleIntersectionCalculated = (intersectionData: any) => {
        if (!mapRef.current) {
            console.log("Map not available");
            return;
        }
        
        // Store the intersection data for use with the meeting point component
        setIntersectionData(intersectionData);
        
        // If there are no features in the intersection data, clear any existing intersection layers
        if (!intersectionData || !intersectionData.features || intersectionData.features.length === 0) {
            const map = mapRef.current;
            
            // Remove any existing intersection layers
            if (map.getLayer('isochrone-intersection-border')) {
                map.removeLayer('isochrone-intersection-border');
            }
            
            if (map.getLayer('isochrone-intersection')) {
                map.removeLayer('isochrone-intersection');
            }
            
            if (map.getSource('isochrone-intersection-source')) {
                map.removeSource('isochrone-intersection-source');
            }
            
            console.log("No intersection found, layers removed");
            return;
        }

        const map = mapRef.current;
        
        // Remove any existing intersection layers
        if (map.getLayer('isochrone-intersection')) {
            map.removeLayer('isochrone-intersection');
        }
        
        if (map.getSource('isochrone-intersection-source')) {
            map.removeSource('isochrone-intersection-source');
        }
        
        // Add intersection data as a new source
        map.addSource('isochrone-intersection-source', {
            type: 'geojson',
            data: intersectionData
        });
        
        // Add a layer for the intersection area with a distinctive style
        map.addLayer({
            id: 'isochrone-intersection',
            type: 'fill',
            source: 'isochrone-intersection-source',
            layout: {},
            paint: {
                'fill-color': '#00ff00', // Green color for intersection
                'fill-opacity': 0.6,
                'fill-outline-color': '#008800' // Darker green outline
            }
        });
        
        // Add a border to make it more visible
        map.addLayer({
            id: 'isochrone-intersection-border',
            type: 'line',
            source: 'isochrone-intersection-source',
            layout: {},
            paint: {
                'line-color': '#008800',
                'line-width': 2
            }
        });
        
        // Fit the map to show the intersection area
        const bounds = new mapboxgl.LngLatBounds();
        
        intersectionData.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
                    bounds.extend(coord);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach((polygon: any) => {
                    polygon[0].forEach((coord: [number, number]) => {
                        bounds.extend(coord);
                    });
                });
            }
        });
        
        map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 15
        });
    };

    const handleGenerateIsochrones = async (options: IsochroneRequestOptions) => {
        setIsProcessingIsochrones(true);
        
        try {
            // Ensure we have the right attributes for displaying area
            if (!options.attributes) {
                options.attributes = ["area"];
            } else if (!options.attributes.includes("area")) {
                options.attributes.push("area");
            }
            
            const result = await generateIsochrones(options);
            
            // Store the isochrone data for later use with intersection calculation
            setIsochroneData(result);
            
            // Clear any existing isochrone layers
            if (mapRef.current) {
                // Remove existing isochrone layers and sources
                const map = mapRef.current;
                const sources = map.getStyle().sources;
                
                Object.keys(sources).forEach(sourceId => {
                    if (sourceId.startsWith('isochrone-')) {
                        // Get related layers
                        map.getStyle().layers.forEach(layer => {
                            if (layer.source === sourceId) {
                                map.removeLayer(layer.id);
                            }
                        });
                        map.removeSource(sourceId);
                    }
                });
                
                // Add new isochrone data to the map
                if (result && result.features) {
                    // Group features by their group index
                    const groupedFeatures: {[key: number]: any[]} = {};
                    
                    result.features.forEach((feature: any) => {
                        const groupIndex = feature.properties.group_index;
                        if (!groupedFeatures[groupIndex]) {
                            groupedFeatures[groupIndex] = [];
                        }
                        groupedFeatures[groupIndex].push(feature);
                    });
                    
                    // Add each group as a separate source and layer
                    Object.entries(groupedFeatures).forEach(([groupIndex, features], idx) => {
                        const sourceId = `isochrone-source-${groupIndex}`;
                        const layerId = `isochrone-layer-${groupIndex}`;
                        
                        // Create a GeoJSON source
                        map.addSource(sourceId, {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: features
                            }
                        });
                        
                        // Create a fill layer for the isochrones
                        // Use different colors for different groups (user A vs user B)
                        const color = idx === 0 ? 
                            ['#0088ff', '#66aaff'] : // blue for first user
                            ['#ff4444', '#ff8888'];  // red for second user
                        
                        map.addLayer({
                            id: layerId,
                            type: 'fill',
                            source: sourceId,
                            layout: {},
                            paint: {
                                'fill-color': [
                                    'match',
                                    ['get', 'value'],
                                    features[0].properties.value, color[0],
                                    features.length > 1 ? features[1].properties.value : 0, color[1],
                                    '#000000'
                                ],
                                'fill-opacity': 0.3,
                                'fill-outline-color': '#000000'
                            }
                        });
                        
                        // If we have intersection data, add that as a separate layer
                        if (options.intersections && idx === 1) { // Only after adding both isochrone layers
                            // Add a layer for intersection area
                            const intersectionLayerId = 'isochrone-intersection';
                            
                            // Use a combination of source-in and source-atop operations to show intersection
                            map.addLayer({
                                id: intersectionLayerId,
                                type: 'fill',
                                source: sourceId, // Use the second source
                                layout: {},
                                paint: {
                                    'fill-color': '#00ff00', // Green for intersection
                                    'fill-opacity': 0.5
                                },
                                filter: ['==', ['get', 'group_index'], 1] // Only for the second group
                            }, layerId); // Place below the second isochrone layer
                        }
                    });
                }
            }
            
            // Move to next step in the UI
            goToNextStep();
        } catch (error) {
            console.error("Error generating isochrones:", error);
            alert("Failed to generate travel time areas. Please try again.");
        } finally {
            setIsProcessingIsochrones(false);
        }
    };

    return (
        <div className="relative w-full h-screen bg-white dark:bg-gray-900 font-body">
            {/* Map container - now always full width */}
            <div ref={mapContainer} className="w-full h-screen" />
            
            {/* Sidebar - overlay on the map with transform */}
            <div 
                className={`absolute top-0 left-0 h-screen bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 z-30 flex flex-col w-96
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Sidebar header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                        {currentStep === 0 ? "Select Locations" : 
                         currentStep === 1 ? "Travel Time Analysis" : 
                         "Choose Meeting Location"}
                    </h2>
                    <button 
                        onClick={() => toggleSidebar(false)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                
                {/* Sidebar content - scrollable area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Step back button if not on first step */}
                    {currentStep > 0 && (
                        <button 
                            onClick={goToPreviousStep}
                            className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-primary"
                        >
                            <ChevronLeft size={18} />
                            <span>Back to locations</span>
                        </button>
                    )}
                    
                    {currentStep === 0 ? (
                        <TwoPointSelector 
                            map={mapRef.current} 
                            onLocationSelected={handleLocationSelected}
                            onNextStep={goToNextStep}
                        />
                    ) : currentStep === 1 ? (
                        <IsochroneOptions
                            locations={selectedLocations}
                            onGenerateIsochrones={handleGenerateIsochrones}
                            isLoading={isProcessingIsochrones}
                        />
                    ) : (
                        <MeetingPointOptions 
                            map={mapRef.current}
                            isochroneData={isochroneData}
                            onMeetingPointSelected={handleMeetingPointSelected}
                            onIntersectionCalculated={handleIntersectionCalculated}
                            onNextStep={goToNextStep}
                        />
                    )}
                </div>
            </div>
            
            {/* Toggle sidebar button - only visible when sidebar is closed */}
            {!isSidebarOpen && (
                <button
                    onClick={() => toggleSidebar(true)}
                    className="absolute top-4 left-4 z-20 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Open sidebar"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
            
            {/* Steps Indicator at the top */}
            <StepsIndicator currentStep={currentStep} />
            
            {/* Map Picker Indicator - only shows when actively picking a location */}
            {showPickerHint && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                            <MapIcon size={16} className="text-green-600" />
                            <span className="text-green-800 dark:text-green-200 text-sm">
                                Click anywhere to set location
                            </span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Include the Navbar component at the bottom */}
            <Navbar />
            
            {/* Custom styles for popups */}
            <style jsx global>{`
                .mapboxgl-popup-content {
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    padding: 0;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                
                .dark .mapboxgl-popup-content {
                    background-color: #1f2937;
                    color: #f3f4f6;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .mapboxgl-popup-close-button {
                    font-size: 18px;
                    padding: 4px 8px; 
                    color: #6b7280;
                    background: transparent;
                    border: none;
                    z-index: 2;
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    transition: color 0.2s ease;
                }
                
                .mapboxgl-popup-close-button:hover {
                    color: #111827;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
                
                .dark .mapboxgl-popup-close-button {
                    color: #d1d5db;
                }
                
                .dark .mapboxgl-popup-close-button:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}