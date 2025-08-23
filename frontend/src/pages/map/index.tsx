"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapOverlay from "./map-overlay";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lng: string, lat: string } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);
    const clickListenerRef = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);

    useEffect(() => {
        // Initialize map only once
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/nabcat/cmeogbsmg000j01sf76ji60t8",
            center: [106.8456, -6.2088], // Jakarta
            zoom: 15,
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add a default marker for Jakarta
        updateMarker(106.8456, -6.2088, "Jakarta");
        setSelectedLocation({ lng: "106.8456", lat: "-6.2088" });

        // Click Event to add markers
        map.on("click", (e) => {
            if (isManualMode) return; // Skip if we're in manual selection mode (handled separately)
            
            const { lng, lat } = e.lngLat;
            updateMarker(lng, lat, "Selected Location");
        });

        // Clean up function
        return () => {
            map.remove();
        };
    }, [isManualMode]);

    // Update marker - centralized function to handle marker creation/updates
    const updateMarker = (longitude: number, latitude: number, label: string) => {
        // Format coordinates to 4 decimal places
        const formattedLng = longitude.toFixed(4);
        const formattedLat = latitude.toFixed(4);

        // Update selected location
        setSelectedLocation({ lng: formattedLng, lat: formattedLat });

        // Create popup for location
        const popup = createPopup(label, formattedLng, formattedLat);

        // Remove existing marker if it exists
        if (markerRef.current) {
            markerRef.current.remove();
        }

        // Add a new marker at the location
        const newMarker = new mapboxgl.Marker({
            color: "#3FB1CE",
            draggable: false,
            scale: 1.2
        })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(mapRef.current!);

        // Store reference to current marker
        markerRef.current = newMarker;

        // Show the popup by default
        newMarker.togglePopup();
    };

    // Create a styled popup with location information
    const createPopup = (title: string, longitude: string, latitude: string) => {
        return new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            maxWidth: "300px",
            className: "custom-popup"
        }).setHTML(
            `<div class="p-4 font-body">
                <h3 class="font-bold text-lg mb-2 text-primary">${title}</h3>
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                    <span class="font-medium text-gray-700 dark:text-gray-300">Longitude:</span>
                    <span class="text-gray-900 dark:text-white font-mono">${longitude}</span>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Latitude:</span>
                    <span class="text-gray-900 dark:text-white font-mono">${latitude}</span>
                </div>
                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Click anywhere on map to update location
                </div>
            </div>`
        );
    };

    // Handle location found (either automatically or manually)
    const handleLocationFound = (longitude: number, latitude: number, label: string) => {
        // Update marker with new location
        updateMarker(longitude, latitude, label);

        // Fly to location
        mapRef.current!.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            speed: 1.5,
            curve: 1,
            essential: true
        });
    };

    // Function to get current location with high accuracy
    const getCurrentLocation = () => {
        setIsLocating(true);
        
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }
        
        // Now that we have HTTPS, this should work properly
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Geolocation success!", position.coords);
                const { longitude, latitude, accuracy } = position.coords;
                
                // Add accuracy information to the popup
                handleLocationFound(longitude, latitude, 
                    `My Location (±${Math.round(accuracy)}m)`);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let message;
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = "You denied permission to access your location";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get your location timed out";
                        break;
                    default:
                        message = error.message;
                }
                
                alert(`Unable to get your location: ${message}`);
                enableManualLocationPicker();
                setIsLocating(false);
            },
            options
        );
    };

    // Handle manual location picking
    const enableManualLocationPicker = () => {
        if (!mapRef.current) return;

        // Set manual mode flag
        setIsManualMode(true);

        // Change cursor to indicate selection mode
        mapRef.current.getCanvas().style.cursor = 'crosshair';

        // Create click handler
        const clickHandler = (e: mapboxgl.MapMouseEvent) => {
            const { lng, lat } = e.lngLat;

            // Process the selected location
            handleLocationFound(lng, lat, "Selected Location");

            // Reset the UI
            if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
                mapRef.current.off('click', clickHandler);
            }

            setIsManualMode(false);
            setIsLocating(false);
        };

        // Store reference to the handler for cleanup
        clickListenerRef.current = clickHandler;

        // Add the click listener
        mapRef.current.on('click', clickHandler);
    };

    // Function to remove marker
    const removeMarker = () => {
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
        
        setSelectedLocation(null);
    };

    return (
        <div className="relative w-full h-screen bg-white dark:bg-gray-900 font-body">
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-screen" />

            {/* Manual mode indicator */}
            {isManualMode && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white py-3 text-center font-medium shadow-lg">
                    Click on the map to set your location
                </div>
            )}

            <MapOverlay
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                selectedLocation={selectedLocation}
                onRemoveAllMarkers={removeMarker}
                onGetCurrentLocation={getCurrentLocation}
                isLocating={isLocating} markers={[]}            />

            {/* Add this style tag for custom popup styles */}
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
                
                .mapboxgl-popup-tip {
                    border-top-color: #1f2937 !important;
                }
            `}</style>
        </div>
    );
}