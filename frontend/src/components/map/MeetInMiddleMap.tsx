import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/types/location';
import { IsochroneOptions, OverlapArea } from '@/types/isochrone';
import { Place } from '@/types/places';
import { MeetingStep } from '@/types/meeting';
import { useIsochrone } from '@/hooks/useIsochrone';
import { useDirections } from '@/hooks/useDirections';
import LocationSelector from './LocationSelector';
import IsochroneLayer from './IsochroneLayer';
import MeetingSpotSelector from './MeetingSpotSelector';
import NavigationPanel from './NavigationPanel';
import { ChevronLeft, ChevronRight, MapPin, Users, Navigation, Loader2, MapIcon } from 'lucide-react';
import { mapboxService } from '@/services/mapboxService';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MeetInMiddleMapProps {
    className?: string;
}

export default function MeetInMiddleMap({ className = '' }: MeetInMiddleMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapReady, setMapReady] = useState(false);

    // State management
    const [currentStep, setCurrentStep] = useState<MeetingStep>('location');
    const [userALocation, setUserALocation] = useState<Location | null>(null);
    const [userBLocation, setUserBLocation] = useState<Location | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [travelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
    const [maxTravelTime] = useState(30);
    const [overlapArea, setOverlapArea] = useState<OverlapArea | null>(null);
    const [activeMapPicker, setActiveMapPicker] = useState<'A' | 'B' | null>(null);

    // Custom hooks
    const {
        userAIsochrone,
        userBIsochrone,
        overlapArea: isochroneOverlap,
        isLoading: isIsochroneLoading,
        error: isochroneError,
        generateIsochrones,
        clearIsochrones
    } = useIsochrone();

    const {
        userARoute,
        userBRoute,
        isLoading: isDirectionsLoading,
        error: directionsError,
        getDirections,
        clearDirections
    } = useDirections();

    // Initialize map
    useEffect(() => {
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

        // Add geolocate control
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            "top-right"
        );

        // Wait for map to be fully loaded
        map.on('load', () => {
            console.log('Map is fully loaded and ready');
            setMapReady(true);
        });

        map.on('style.load', () => {
            console.log('Map style is loaded');
        });

        return () => {
            map.remove();
            setMapReady(false);
        };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add user A marker
        if (userALocation) {
            const markerA = new mapboxgl.Marker({ color: '#3B82F6', scale: 1.2 })
                .setLngLat([userALocation.coordinates.lng, userALocation.coordinates.lat])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
            <div class="p-2 text-body">
              <h3 class="font-semibold text-sm text-blue-600">User A</h3>
              <p class="text-xs text-gray-600">${userALocation.name}</p>
            </div>
          `)
                )
                .addTo(mapRef.current);
            markersRef.current.push(markerA);
        }

        // Add user B marker
        if (userBLocation) {
            const markerB = new mapboxgl.Marker({ color: '#EF4444', scale: 1.2 })
                .setLngLat([userBLocation.coordinates.lng, userBLocation.coordinates.lat])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm text-red-600">User B</h3>
              <p class="text-xs text-gray-600">${userBLocation.name}</p>
            </div>
          `)
                )
                .addTo(mapRef.current);
            markersRef.current.push(markerB);
        }

        // Add meeting spot marker
        if (selectedPlace) {
            const markerSpot = new mapboxgl.Marker({ color: '#10B981', scale: 1.5 })
                .setLngLat([selectedPlace.coordinates.lng, selectedPlace.coordinates.lat])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm text-green-600">Meeting Spot</h3>
              <p class="text-xs text-gray-600">${selectedPlace.name}</p>
            </div>
          `)
                )
                .addTo(mapRef.current);
            markersRef.current.push(markerSpot);
        }
    }, [userALocation, userBLocation, selectedPlace]);

    // Update overlap area from isochrone hook
    useEffect(() => {
        if (isochroneOverlap) {
            setOverlapArea(isochroneOverlap);
        }
    }, [isochroneOverlap]);

    // Add map click handler
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;
        
        const map = mapRef.current;
        
        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            if (!activeMapPicker) return;
            
            // Get the clicked coordinates
            const { lng, lat } = e.lngLat;
            
            // Reverse geocode to get place name
            mapboxService.reverseGeocode(lng, lat)
                .then(placeName => {
                    const newLocation: Location = {
                        id: `map-${Date.now()}`,
                        name: placeName || `Selected Point (${lng.toFixed(4)}, ${lat.toFixed(4)})`,
                        coordinates: { lng, lat },
                        address: placeName || '',
                        type: 'map',
                        timestamp: Date.now()
                    };
                    
                    if (activeMapPicker === 'A') {
                        setUserALocation(newLocation);
                    } else {
                        setUserBLocation(newLocation);
                    }
                    
                    // Turn off map picker mode
                    setActiveMapPicker(null);
                })
                .catch(() => {
                    // Handle error by using coordinates as name
                    const newLocation: Location = {
                        id: `map-${Date.now()}`,
                        name: `Selected Point (${lng.toFixed(4)}, ${lat.toFixed(4)})`,
                        coordinates: { lng, lat },
                        address: '',
                        type: 'map',
                        timestamp: Date.now()
                    };
                    
                    if (activeMapPicker === 'A') {
                        setUserALocation(newLocation);
                    } else {
                        setUserBLocation(newLocation);
                    }
                    
                    // Turn off map picker mode
                    setActiveMapPicker(null);
                });
        };
        
        if (activeMapPicker) {
            // Set cursor style and add click listener when picker is active
            map.getCanvas().style.cursor = 'crosshair';
            map.once('click', handleMapClick);
        } else {
            // Reset cursor style when picker is not active
            map.getCanvas().style.cursor = '';
        }
        
        return () => {
            // Clean up
            map.off('click', handleMapClick);
            map.getCanvas().style.cursor = '';
        };
    }, [activeMapPicker, mapReady, mapRef]);
    
    // Handle map picker toggle
    const handleMapPickerToggle = (userType: 'A' | 'B', isActive: boolean) => {
        setActiveMapPicker(isActive ? userType : null);
    };

    // Handle location selection
    useEffect(() => {
        if (userALocation && userBLocation) {
            setCurrentStep('isochrone');
            handleGenerateIsochrones();
        } else {
            setCurrentStep('location');
            clearIsochrones();
            clearDirections();
        }
    }, [userALocation, userBLocation]);

    const handleUserALocationSelect = (location: Location) => {
        setUserALocation(location);
    };

    const handleUserBLocationSelect = (location: Location) => {
        setUserBLocation(location);
    };

    const handleUserALocationClear = () => {
        setUserALocation(null);
    };

    const handleUserBLocationClear = () => {
        setUserBLocation(null);
    };

    // Handle isochrone generation
    const handleGenerateIsochrones = async () => {
        if (!userALocation || !userBLocation) return;

        // Use a single travel time parameter
        const options: IsochroneOptions = {
            profile: travelMode,
            minutes: [maxTravelTime], // Single value in array
            colors: ['#3B82F6'],      // Single color
            polygons: true,
        };

        console.log('Generating isochrones with options:', options);
        await generateIsochrones(userALocation, userBLocation, options);
        // Don't change step yet - let user see the isochrones first
    };

    // Handle place selection
    const handlePlaceSelect = (place: Place) => {
        setSelectedPlace(place);
        setCurrentStep('navigation');
    };

    // Handle directions
    const handleGetDirections = async () => {
        if (!userALocation || !userBLocation || !selectedPlace) {
            console.error('Cannot get directions: missing locations or selected place');
            return;
        }

        console.log('Getting directions to meeting spot:', {
            userALocation,
            userBLocation,
            selectedPlace
        });

        try {
            await getDirections(userALocation, userBLocation, selectedPlace, {
                profile: travelMode,
                steps: true,
                geometries: 'geojson',
                overview: 'full',
            });
        } catch (error) {
            console.error('Error getting directions:', error);
        }
    };

    // Handle step navigation
    const handleNextStep = () => {
        switch (currentStep) {
            case 'location':
                if (userALocation && userBLocation) {
                    handleGenerateIsochrones();
                }
                break;
            case 'isochrone':
                if (userAIsochrone && userBIsochrone) {
                    setCurrentStep('places');
                }
                break;
            case 'places':
                if (selectedPlace) {
                    setCurrentStep('navigation');
                }
                break;
        }
    };

    const handlePrevStep = () => {
        switch (currentStep) {
            case 'isochrone':
                setCurrentStep('location');
                break;
            case 'places':
                setCurrentStep('isochrone');
                break;
            case 'navigation':
                setCurrentStep('places');
                break;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'location':
                return userALocation && userBLocation;
            case 'isochrone':
                return userAIsochrone && userBIsochrone && !isIsochroneLoading;
            case 'places':
                return selectedPlace;
            case 'navigation':
                return true;
            default:
                return false;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'location':
                return 'Select Locations';
            case 'isochrone':
                return 'Find Meeting Area';
            case 'places':
                return 'Choose Meeting Spot';
            case 'navigation':
                return 'Get Directions';
            default:
                return '';
        }
    };

    return (
        <div className={`relative w-full h-screen bg-white dark:bg-gray-900 ${className}`}>
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-screen" />

            {/* Isochrone Layer */}
            {mapRef.current && mapReady && (
                <IsochroneLayer
                    map={mapRef.current}
                    userAIsochrone={userAIsochrone}
                    userBIsochrone={userBIsochrone}
                    userALocation={userALocation}
                    userBLocation={userBLocation}
                    options={{
                        profile: travelMode,
                        minutes: [maxTravelTime], // Single value in array
                        colors: ['#3B82F6'],      // Single color
                        polygons: true,
                    }}
                    onOverlapAreaChange={setOverlapArea}
                />
            )}

            {/* Step Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${currentStep === 'location' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <MapPin size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${currentStep === 'isochrone' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <Users size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${currentStep === 'places' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <MapPin size={12} className="text-gray-500" />
                        </div>
                        <ChevronRight size={12} className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${currentStep === 'navigation' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <Navigation size={12} className="text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Ready Indicator */}
            {!mapReady && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                            <Loader2 size={16} className="animate-spin text-yellow-600" />
                            <span className="text-yellow-800 dark:text-yellow-200 text-sm">Loading map...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Control Panel */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                            {getStepTitle()}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {currentStep !== 'location' && (
                                <button
                                    onClick={handlePrevStep}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            {currentStep !== 'navigation' && (
                                <button
                                    onClick={handleNextStep}
                                    className="p-2 text-primary hover:text-primary/80"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step Content */}
                    {currentStep === 'location' && (
                        <div className="space-y-4">
                            <LocationSelector
                                userType="A"
                                location={userALocation}
                                onLocationSelect={handleUserALocationSelect}
                                onLocationClear={handleUserALocationClear}
                                onMapPickerToggle={handleMapPickerToggle}
                                isMapPickerActive={activeMapPicker === 'A'}
                            />
                            <LocationSelector
                                userType="B"
                                location={userBLocation}
                                onLocationSelect={handleUserBLocationSelect}
                                onLocationClear={handleUserBLocationClear}
                                onMapPickerToggle={handleMapPickerToggle}
                                isMapPickerActive={activeMapPicker === 'B'}
                            />
                        </div>
                    )}

                    {currentStep === 'isochrone' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                    Isochrone Analysis
                                </h3>

                                {isIsochroneLoading && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 size={20} className="mr-2 animate-spin text-primary" />
                                        <span className="text-gray-600 dark:text-gray-400">Generating travel time areas...</span>
                                    </div>
                                )}

                                {isochroneError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{isochroneError}</p>
                                    </div>
                                )}

                                {userAIsochrone && userBIsochrone && !isIsochroneLoading && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                                <span className="font-medium text-blue-800 dark:text-blue-200">User A Isochrone</span>
                                            </div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                {userAIsochrone.features.length} travel time areas generated
                                            </p>
                                            <details className="mt-2">
                                                <summary className="text-xs text-blue-500 cursor-pointer">Debug Info</summary>
                                                <pre className="text-xs text-blue-600 dark:text-blue-400 mt-1 overflow-auto max-h-20">
                                                    {JSON.stringify(userAIsochrone, null, 2)}
                                                </pre>
                                            </details>
                                        </div>

                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                                <span className="font-medium text-red-800 dark:text-red-200">User B Isochrone</span>
                                            </div>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {userBIsochrone.features.length} travel time areas generated
                                            </p>
                                            <details className="mt-2">
                                                <summary className="text-xs text-red-500 cursor-pointer">Debug Info</summary>
                                                <pre className="text-xs text-red-600 dark:text-red-400 mt-1 overflow-auto max-h-20">
                                                    {JSON.stringify(userBIsochrone, null, 2)}
                                                </pre>
                                            </details>
                                        </div>

                                        {overlapArea && (
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="font-medium text-green-800 dark:text-green-200">Overlap Area</span>
                                                </div>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    Meeting area found! Travel time: {overlapArea.properties.travelTime} minutes
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Map ready: {mapReady ? 'Yes' : 'No'} | Check the map to see the colored travel time areas and overlap
                                        </div>
                                    </div>
                                )}

                                {!userAIsochrone && !userBIsochrone && !isIsochroneLoading && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Isochrones will be generated automatically when both locations are selected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 'places' && (
                        <MeetingSpotSelector
                            overlapArea={overlapArea}
                            onPlaceSelect={handlePlaceSelect}
                            selectedPlace={selectedPlace}
                        />
                    )}

                    {currentStep === 'navigation' && (
                        <NavigationPanel
                            userARoute={userARoute}
                            userBRoute={userBRoute}
                            userALocation={userALocation}
                            userBLocation={userBLocation}
                            meetingSpot={selectedPlace}
                            isLoading={isDirectionsLoading}
                            error={directionsError}
                            onGetDirections={handleGetDirections}
                        />
                    )}
                </div>
            </div>

            {/* Map Picker Indicator */}
            {activeMapPicker && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                            <MapIcon size={16} className="text-green-600" />
                            <span className="text-green-800 dark:text-green-200 text-sm">
                                Click anywhere to set User {activeMapPicker}`s location
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

type LocationPickerType = "current" | "manual" | "search" | "A" | "B";
